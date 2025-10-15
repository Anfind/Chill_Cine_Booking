import { NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import { Branch, City } from '@/lib/models'

export const dynamic = 'force-dynamic'

/**
 * GET /api/branches/[id]
 * Lấy thông tin chi tiết một branch
 */
export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    await connectDB()

    const { id } = await params

    // Support both ObjectId and slug
    const branch = await Branch.findOne({
      $or: [{ _id: id }, { slug: id }],
      isActive: true,
    })
      .populate('cityId', 'name code')
      .lean()

    if (!branch) {
      return NextResponse.json(
        {
          success: false,
          error: 'Branch not found',
        },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      data: branch,
    })
  } catch (error) {
    console.error('Error fetching branch:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch branch',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}
