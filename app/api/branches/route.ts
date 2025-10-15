import { NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import { Branch, City } from '@/lib/models'

export const dynamic = 'force-dynamic'

/**
 * GET /api/branches?cityId=xxx
 * Lấy danh sách branches theo cityId
 * Nếu không có cityId, trả về tất cả branches
 */
export async function GET(request: Request) {
  try {
    await connectDB()

    const { searchParams } = new URL(request.url)
    const cityId = searchParams.get('cityId')

    let query: any = { isActive: true }
    if (cityId) {
      query.cityId = cityId
    }

    const branches = await Branch.find(query)
      .populate('cityId', 'name code')
      .sort({ name: 1 })
      .lean()

    return NextResponse.json({
      success: true,
      data: branches,
      count: branches.length,
      filters: cityId ? { cityId } : {},
    })
  } catch (error) {
    console.error('Error fetching branches:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch branches',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}
