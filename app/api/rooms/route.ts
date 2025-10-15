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
