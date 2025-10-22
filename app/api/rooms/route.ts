import { NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import { Room, Branch, RoomType } from '@/lib/models'

export const dynamic = 'force-dynamic'

/**
 * GET /api/rooms?branchId=xxx&status=available
 * Lấy danh sách rooms theo branchId và status
 */
export async function GET(request: Request) {
  try {
    await connectDB()

    const { searchParams } = new URL(request.url)
    const branchId = searchParams.get('branchId')
    const status = searchParams.get('status') || 'available'

    let query: any = { isActive: true }
    
    if (branchId) {
      query.branchId = branchId
    }
    
    if (status) {
      query.status = status
    }

    const rooms = await Room.find(query)
      .populate('branchId', 'name address phone')
      .populate('roomTypeId', 'name slug color')
      .sort({ name: 1 })
      .lean()

    return NextResponse.json({
      success: true,
      data: rooms,
      count: rooms.length,
      filters: { branchId, status },
    })
  } catch (error) {
    console.error('Error fetching rooms:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch rooms',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}

/**
 * POST /api/rooms
 * Tạo room mới
 */
export async function POST(request: Request) {
  try {
    await connectDB()
    const body = await request.json()

    // Validation
    if (!body.name || !body.branchId || !body.roomTypeId) {
      return NextResponse.json(
        {
          success: false,
          error: 'Missing required fields: name, branchId, roomTypeId',
        },
        { status: 400 }
      )
    }

    // Verify branch and roomType exist
    const [branchExists, roomTypeExists] = await Promise.all([
      Branch.exists({ _id: body.branchId }),
      RoomType.exists({ _id: body.roomTypeId }),
    ])

    if (!branchExists) {
      return NextResponse.json(
        { success: false, error: 'Branch not found' },
        { status: 400 }
      )
    }

    if (!roomTypeExists) {
      return NextResponse.json(
        { success: false, error: 'Room type not found' },
        { status: 400 }
      )
    }

    const room = await Room.create({
      name: body.name,
      branchId: body.branchId,
      roomTypeId: body.roomTypeId,
      description: body.description || '',
      images: body.images || [],
      amenities: body.amenities || [],
      capacity: body.capacity || 2,
      pricePerHour: body.price || 0,
      status: body.status || 'available',
      isActive: true,
      code: body.code || `R${Date.now().toString().slice(-6)}`, // Generate code if not provided
    })

    // Populate before returning
    const populatedRoom = await Room.findById(room._id)
      .populate('branchId', 'name address phone')
      .populate('roomTypeId', 'name slug color')
      .lean()

    return NextResponse.json(
      {
        success: true,
        data: populatedRoom,
        message: 'Room created successfully',
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('Error creating room:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to create room',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}
