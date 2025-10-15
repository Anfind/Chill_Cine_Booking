import { NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import { City } from '@/lib/models'

export const dynamic = 'force-dynamic'

/**
 * GET /api/cities
 * Lấy danh sách tất cả cities (Tỉnh/Thành phố)
 */
export async function GET() {
  try {
    await connectDB()

    const cities = await City.find({ isActive: true }).sort({ displayOrder: 1 }).lean()

    return NextResponse.json({
      success: true,
      data: cities,
      count: cities.length,
    })
  } catch (error) {
    console.error('Error fetching cities:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch cities',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}
