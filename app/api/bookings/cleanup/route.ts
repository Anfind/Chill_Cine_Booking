import { NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import Booking from '@/lib/models/Booking'

/**
 * POST /api/bookings/cleanup
 * 
 * Tự động hủy các booking pending chưa thanh toán sau 10 phút
 * 
 * Logic:
 * 1. Tìm tất cả booking có:
 *    - status = 'pending'
 *    - paymentStatus = 'unpaid'
 *    - createdAt < (current_time - 10 minutes)
 * 
 * 2. Tại sao dùng createdAt thay vì paymentQRCreatedAt?
 *    - Đảm bảo MỌI booking pending đều bị hủy sau 10 phút
 *    - Tránh lỗ hổng: User tạo booking nhưng không vào payment page
 *      → paymentQRCreatedAt = null → Booking không bao giờ bị hủy!
 *    - createdAt luôn tồn tại (Mongoose timestamps tự động tạo)
 * 
 * 3. Cập nhật:
 *    - status = 'cancelled'
 *    - cancelReason = 'Auto-cancelled: Payment timeout (X minutes since booking creation)'
 *    - cancelledAt = current_time
 * 
 * 4. Trả về số lượng booking đã hủy
 * 
 * Security: Chỉ chạy từ internal (cron job hoặc có secret key)
 */
export async function POST(request: Request) {
  try {
    // Security: Check authorization header
    const authHeader = request.headers.get('authorization')
    const cronSecret = process.env.CRON_SECRET || 'default-cron-secret-change-me'
    
    if (authHeader !== `Bearer ${cronSecret}`) {
      console.warn('⚠️  Unauthorized cleanup attempt')
      return NextResponse.json(
        { 
          success: false, 
          error: 'Unauthorized' 
        },
        { status: 401 }
      )
    }

    await connectDB()

    // Calculate cutoff time: 10 minutes ago from booking creation
    const now = new Date()
    const cutoffTime = new Date(now.getTime() - 10 * 60 * 1000) // 10 minutes = 600 seconds

    console.log('🔍 Searching for expired bookings...', {
      currentTime: now.toISOString(),
      cutoffTime: cutoffTime.toISOString(),
      note: 'Checking createdAt (not paymentQRCreatedAt) to catch all pending bookings',
    })

    // Find all expired pending bookings
    // Use createdAt instead of paymentQRCreatedAt to ensure ALL pending bookings are cancelled
    // This prevents users from "reserving" slots forever by creating booking but never visiting payment page
    const expiredBookings = await Booking.find({
      status: 'pending',
      paymentStatus: 'unpaid',
      createdAt: { 
        $lt: cutoffTime // Created more than 10 minutes ago
      },
    })

    if (expiredBookings.length === 0) {
      console.log('✅ No expired bookings found')
      return NextResponse.json({
        success: true,
        cancelledCount: 0,
        message: 'No expired bookings to cancel',
      })
    }

    console.log(`📋 Found ${expiredBookings.length} expired booking(s):`)
    
    // Cancel each booking
    const cancelledBookings: any[] = []
    
    for (const booking of expiredBookings) {
      // Calculate elapsed time from booking creation (not QR creation)
      const elapsed = Math.floor((now.getTime() - new Date(booking.createdAt).getTime()) / 1000)
      
      console.log(`  - ${booking.bookingCode} (ID: ${booking._id})`, {
        createdAt: booking.createdAt,
        paymentQRCreatedAt: booking.paymentQRCreatedAt || 'N/A (never visited payment page)',
        elapsedSeconds: elapsed,
        room: booking.roomId,
        customer: booking.customerInfo?.name,
      })

      // Update booking status
      booking.status = 'cancelled'
      booking.cancelReason = `Auto-cancelled: Payment timeout (${Math.floor(elapsed / 60)} minutes since booking creation)`
      booking.cancelledAt = now
      
      await booking.save()
      
      cancelledBookings.push({
        bookingCode: booking.bookingCode,
        bookingId: String(booking._id),
        customerName: booking.customerInfo?.name,
        elapsedMinutes: Math.floor(elapsed / 60),
        hadQRCode: !!booking.paymentQRCreatedAt,
      })
    }

    console.log(`✅ Successfully cancelled ${cancelledBookings.length} expired booking(s)`)

    return NextResponse.json({
      success: true,
      cancelledCount: cancelledBookings.length,
      bookings: cancelledBookings,
      timestamp: now.toISOString(),
    })

  } catch (error) {
    console.error('❌ Error during booking cleanup:', error)
    
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to cleanup expired bookings',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}

/**
 * GET /api/bookings/cleanup (for testing)
 * 
 * Preview which bookings would be cancelled without actually cancelling them
 */
export async function GET(request: Request) {
  try {
    // Security: Check authorization header
    const authHeader = request.headers.get('authorization')
    const cronSecret = process.env.CRON_SECRET || 'default-cron-secret-change-me'
    
    if (authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Unauthorized' 
        },
        { status: 401 }
      )
    }

    await connectDB()

    // Calculate cutoff time: 10 minutes ago
    const now = new Date()
    const cutoffTime = new Date(now.getTime() - 10 * 60 * 1000)

    // Find all expired pending bookings (preview only)
    // Use createdAt to catch all pending bookings, including those that never visited payment page
    const expiredBookings = await Booking.find({
      status: 'pending',
      paymentStatus: 'unpaid',
      createdAt: { 
        $lt: cutoffTime
      },
    })
    .select('bookingCode customerInfo.name createdAt paymentQRCreatedAt roomId')
    .lean()

    const preview = expiredBookings.map((booking: any) => {
      const elapsed = Math.floor((now.getTime() - new Date(booking.createdAt).getTime()) / 1000)
      return {
        bookingCode: booking.bookingCode,
        customerName: booking.customerInfo?.name,
        createdAt: booking.createdAt,
        hadQRCode: !!booking.paymentQRCreatedAt,
        elapsedMinutes: Math.floor(elapsed / 60),
        elapsedSeconds: elapsed,
      }
    })

    return NextResponse.json({
      success: true,
      preview: true,
      count: expiredBookings.length,
      bookings: preview,
      cutoffTime: cutoffTime.toISOString(),
      currentTime: now.toISOString(),
    })

  } catch (error) {
    console.error('❌ Error previewing cleanup:', error)
    
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to preview cleanup',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}
