import { NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import { RoomType } from '@/lib/models'

export const dynamic = 'force-dynamic'

/**
 * GET /api/room-types
 * Lấy danh sách loại phòng
 */
export async function GET() {
  try {
    await connectDB()

    const roomTypes = await RoomType.find()
      .sort({ name: 1 })
      .lean()

    return NextResponse.json({
      success: true,
      data: roomTypes,
    })
  } catch (error) {
    console.error('Error fetching room types:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch room types',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}
