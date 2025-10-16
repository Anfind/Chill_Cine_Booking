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

/**
 * PUT /api/rooms/[id]
 * Cập nhật thông tin room
 */
export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    await connectDB()
    const { id } = await params
    const body = await request.json()

    // Verify related entities if they're being updated
    if (body.branchId) {
      const branchExists = await Branch.exists({ _id: body.branchId })
      if (!branchExists) {
        return NextResponse.json(
          { success: false, error: 'Branch not found' },
          { status: 400 }
        )
      }
    }

    if (body.roomTypeId) {
      const roomTypeExists = await RoomType.exists({ _id: body.roomTypeId })
      if (!roomTypeExists) {
        return NextResponse.json(
          { success: false, error: 'Room type not found' },
          { status: 400 }
        )
      }
    }

    const room = await Room.findByIdAndUpdate(
      id,
      { $set: body },
      { new: true, runValidators: true }
    )
      .populate('branchId', 'name address phone')
      .populate('roomTypeId', 'name slug color')

    if (!room) {
      return NextResponse.json(
        { success: false, error: 'Room not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      data: room,
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
 * DELETE /api/rooms/[id]
 * Xóa room (soft delete)
 */
export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    await connectDB()
    const { id } = await params

    // Soft delete: set isActive = false
    const room = await Room.findByIdAndUpdate(
      id,
      { isActive: false, status: 'unavailable' },
      { new: true }
    )

    if (!room) {
      return NextResponse.json(
        { success: false, error: 'Room not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Room deleted successfully',
      data: room,
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
