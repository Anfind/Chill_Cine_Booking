import { NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import { Room, Branch, RoomType } from '@/lib/models'
import { cache, CacheTags, withCache, CacheTTL } from '@/lib/cache'

export const dynamic = 'force-dynamic'

/**
 * GET /api/rooms/[roomId]
 * Lấy thông tin chi tiết 1 phòng
 * 
 * Cached for 15 minutes
 */
export async function GET(
  request: Request,
  { params }: { params: Promise<{ roomId: string }> }
) {
  try {
    await connectDB()

    const { roomId } = await params

    // Cache key based on room ID
    const cacheKey = `room:${roomId}`

    const room = await withCache(
      cacheKey,
      async () => {
        return await Room.findById(roomId)
          .populate('branchId', 'name address phone')
          .populate('roomTypeId', 'name slug color')
          .select('_id name code capacity pricePerHour status branchId roomTypeId images amenities description isActive')
          .lean()
      },
      CacheTTL.FIFTEEN_MINUTES,
      [CacheTags.ROOMS]
    )

    if (!room) {
      return NextResponse.json(
        { success: false, error: 'Room not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(
      {
        success: true,
        data: room,
      },
      {
        headers: {
          'Cache-Control': 'public, s-maxage=900, stale-while-revalidate=1800',
        },
      }
    )
  } catch (error) {
    console.error('Error fetching room:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch room',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}

/**
 * PUT /api/rooms/[roomId]
 * Cập nhật thông tin phòng
 */
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ roomId: string }> }
) {
  try {
    await connectDB()
    const { roomId } = await params
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

    // Check if room exists
    const existingRoom = await Room.findById(roomId)
    if (!existingRoom) {
      return NextResponse.json(
        { success: false, error: 'Room not found' },
        { status: 404 }
      )
    }

    // Update room
    const updatedRoom = await Room.findByIdAndUpdate(
      roomId,
      {
        name: body.name,
        branchId: body.branchId,
        roomTypeId: body.roomTypeId,
        description: body.description || '',
        images: body.images || [],
        amenities: body.amenities || [],
        capacity: body.capacity || 2,
        pricePerHour: body.price || 0,
        status: body.status || 'available',
      },
      { new: true } // Return updated document
    )
      .populate('branchId', 'name address phone')
      .populate('roomTypeId', 'name slug color')
      .lean()

    // Invalidate cache
    cache.clearByTag(CacheTags.ROOMS)

    return NextResponse.json({
      success: true,
      data: updatedRoom,
      message: 'Room updated successfully',
    })
  } catch (error) {
    console.error('Error updating room:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to update room',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}

/**
 * DELETE /api/rooms/[roomId]
 * Xóa phòng (soft delete - set isActive = false)
 */
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ roomId: string }> }
) {
  try {
    await connectDB()

    const { roomId } = await params
    // Check if room exists
    const existingRoom = await Room.findById(roomId)
    if (!existingRoom) {
      return NextResponse.json(
        { success: false, error: 'Room not found' },
        { status: 404 }
      )
    }

    // Soft delete - set isActive to false
    await Room.findByIdAndUpdate(roomId, {
      isActive: false,
      status: 'unavailable',
    })

    // Invalidate cache
    cache.clearByTag(CacheTags.ROOMS)

    return NextResponse.json({
      success: true,
      message: 'Room deleted successfully',
    })
  } catch (error) {
    console.error('Error deleting room:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to delete room',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}
