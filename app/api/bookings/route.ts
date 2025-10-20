import { NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import { Booking, Room, Branch, ComboPackage } from '@/lib/models'

export const dynamic = 'force-dynamic'

/**
 * GET /api/bookings?roomId=xxx&date=2025-10-15
 * Lấy danh sách bookings theo roomId và date
 */
export async function GET(request: Request) {
  try {
    await connectDB()

    const { searchParams } = new URL(request.url)
    const roomId = searchParams.get('roomId')
    const date = searchParams.get('date')
    const branchId = searchParams.get('branchId')

    let query: any = {}

    if (roomId) {
      query.roomId = roomId
    }

    if (branchId) {
      query.branchId = branchId
    }

    if (date) {
      const startOfDay = new Date(date)
      startOfDay.setHours(0, 0, 0, 0)
      const endOfDay = new Date(date)
      endOfDay.setHours(23, 59, 59, 999)

      query.bookingDate = {
        $gte: startOfDay,
        $lte: endOfDay,
      }
    }

    const bookings = await Booking.find(query)
      .populate('roomId', 'name code capacity')
      .populate('branchId', 'name address')
      .sort({ startTime: 1 })
      .lean()

    return NextResponse.json({
      success: true,
      data: bookings,
      count: bookings.length,
      filters: { roomId, date, branchId },
    })
  } catch (error) {
    console.error('Error fetching bookings:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch bookings',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}

/**
 * POST /api/bookings
 * Tạo booking mới
 */
export async function POST(request: Request) {
  try {
    await connectDB()

    const body = await request.json()

    // Validate required fields
    const requiredFields = ['roomId', 'customerInfo', 'startTime', 'endTime']
    for (const field of requiredFields) {
      if (!body[field]) {
        return NextResponse.json(
          {
            success: false,
            error: `Missing required field: ${field}`,
          },
          { status: 400 }
        )
      }
    }

    // Validate customerInfo fields
    if (!body.customerInfo.name || !body.customerInfo.phone || !body.customerInfo.cccd) {
      return NextResponse.json(
        {
          success: false,
          error: 'Thiếu thông tin khách hàng (họ tên, số điện thoại, CCCD)',
        },
        { status: 400 }
      )
    }

    // Validate CCCD format (9 or 12 digits)
    const cccdRegex = /^\d{9}$|^\d{12}$/
    if (!cccdRegex.test(body.customerInfo.cccd)) {
      return NextResponse.json(
        {
          success: false,
          error: 'CCCD/CMND không hợp lệ',
          message: 'CCCD phải là 12 chữ số hoặc CMND cũ 9 chữ số',
        },
        { status: 400 }
      )
    }

    // Parse and validate time
    const startTime = new Date(body.startTime)
    const endTime = new Date(body.endTime)
    const now = new Date()
    
    // Rule 1: Không được đặt giờ quá khứ (phải cách hiện tại ít nhất 5 phút)
    const minBookingTime = new Date(now.getTime() + 5 * 60 * 1000) // +5 phút
    if (startTime < minBookingTime) {
      return NextResponse.json(
        {
          success: false,
          error: 'Không thể đặt phòng cho giờ quá khứ',
          message: 'Vui lòng chọn giờ bắt đầu ít nhất 5 phút sau thời điểm hiện tại',
          minTime: minBookingTime.toISOString(),
        },
        { status: 400 }
      )
    }

    // Rule 2: endTime phải sau startTime
    if (endTime <= startTime) {
      return NextResponse.json(
        {
          success: false,
          error: 'Giờ kết thúc phải sau giờ bắt đầu',
        },
        { status: 400 }
      )
    }

    // Rule 3: Duration tối thiểu 1 giờ
    const minDuration = 1 * 60 * 60 * 1000 // 1 giờ = 3600000ms
    if (endTime.getTime() - startTime.getTime() < minDuration) {
      return NextResponse.json(
        {
          success: false,
          error: 'Thời gian đặt phòng tối thiểu là 1 giờ',
        },
        { status: 400 }
      )
    }

    // Get room info
    const room = await Room.findById(body.roomId)
    if (!room) {
      return NextResponse.json(
        {
          success: false,
          error: 'Room not found',
        },
        { status: 404 }
      )
    }

    // Check for booking conflicts
    const conflictingBooking = await Booking.findOne({
      roomId: body.roomId,
      status: { $in: ['pending', 'confirmed', 'checked-in'] },
      $or: [
        { startTime: { $lt: endTime }, endTime: { $gt: startTime } },
        { startTime: { $gte: startTime, $lt: endTime } },
        { endTime: { $gt: startTime, $lte: endTime } },
      ],
    })

    if (conflictingBooking) {
      return NextResponse.json(
        {
          success: false,
          error: 'Phòng đã được đặt trong khung giờ này',
          message: 'Vui lòng chọn khung giờ khác',
          conflictingBooking: {
            bookingCode: conflictingBooking.bookingCode,
            startTime: conflictingBooking.startTime,
            endTime: conflictingBooking.endTime,
          },
        },
        { status: 409 }
      )
    }

    // Generate unique booking code
    const bookingCode = `BK${Date.now()}${Math.random().toString(36).substr(2, 5).toUpperCase()}`

    // Calculate duration in hours
    const duration = Math.ceil((endTime.getTime() - startTime.getTime()) / (1000 * 60 * 60))

    // Calculate pricing
    let roomTotal = 0
    
    // If combo package is selected, fetch its price from database
    if (body.comboPackageId || body.services?.comboPackageId) {
      const comboId = body.comboPackageId || body.services?.comboPackageId
      const ComboPackage = (await import('@/lib/models/ComboPackage')).default
      const combo = await ComboPackage.findById(comboId)
      if (combo) {
        roomTotal = combo.price
      } else {
        // Fallback to hourly rate if combo not found
        roomTotal = room.pricePerHour * duration
      }
    } else {
      // No combo, use hourly rate
      roomTotal = room.pricePerHour * duration
    }
    
    // Extract menu items from either body.menuItems or body.services.menuItems
    const menuItems = body.menuItems || body.services?.menuItems || []
    const menuTotal = menuItems.reduce((sum: number, item: any) => sum + item.subtotal, 0) || 0
    const subtotal = roomTotal + menuTotal
    const tax = 0 // Can add VAT calculation here
    const discount = body.discount || 0
    const total = subtotal + tax - discount

    // Create booking
    const booking = await Booking.create({
      bookingCode,
      roomId: body.roomId,
      branchId: room.branchId,
      customerInfo: body.customerInfo,
      bookingDate: startTime,
      startTime,
      endTime,
      duration,
      comboPackageId: body.comboPackageId || body.services?.comboPackageId || undefined,
      roomPrice: room.pricePerHour,
      menuItems: body.menuItems || body.services?.menuItems || [],
      pricing: {
        roomTotal,
        menuTotal,
        subtotal,
        tax,
        discount,
        total,
      },
      status: 'pending',
      paymentStatus: 'unpaid',
      notes: body.notes,
    })

    const populatedBooking = await Booking.findById(booking._id)
      .populate('roomId', 'name code capacity')
      .populate('branchId', 'name address phone')
      .populate('comboPackageId', 'name price duration')
      .lean()

    return NextResponse.json(
      {
        success: true,
        data: populatedBooking,
        message: 'Booking created successfully',
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('Error creating booking:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to create booking',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}
