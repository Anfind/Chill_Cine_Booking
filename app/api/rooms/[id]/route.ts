import { NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import { Room, Branch, RoomType } from '@/lib/models'

export const dynamic = 'force-dynamic'

/**
 * GET /api/rooms/[id]
 * Lấy thông tin chi tiết một room
 */
export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    await connectDB()

    const { id } = await params

    // Support both ObjectId and code
    const room = await Room.findOne({
      $or: [{ _id: id }, { code: id.toUpperCase() }],
      isActive: true,
    })
      .populate('branchId', 'name address phone cityId')
      .populate('roomTypeId', 'name slug description features color')
      .lean()

    if (!room) {
      return NextResponse.json(
        {
          success: false,
          error: 'Room not found',
        },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      data: room,
    })
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
