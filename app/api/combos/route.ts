import { NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import { ComboPackage } from '@/lib/models'

export const dynamic = 'force-dynamic'

/**
 * GET /api/combos
 * Lấy danh sách tất cả combo packages
 */
export async function GET() {
  try {
    await connectDB()

    const combos = await ComboPackage.find({ isActive: true }).sort({ displayOrder: 1 }).lean()

    return NextResponse.json({
      success: true,
      data: combos,
      count: combos.length,
    })
  } catch (error) {
    console.error('Error fetching combo packages:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch combo packages',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}
