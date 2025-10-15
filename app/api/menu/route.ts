import { NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import { MenuItem } from '@/lib/models'

export const dynamic = 'force-dynamic'

/**
 * GET /api/menu?category=drink
 * Lấy danh sách menu items
 * Có thể filter theo category
 */
export async function GET(request: Request) {
  try {
    await connectDB()

    const { searchParams } = new URL(request.url)
    const category = searchParams.get('category')

    let query: any = { isAvailable: true }
    if (category) {
      query.category = category
    }

    const menuItems = await MenuItem.find(query).sort({ displayOrder: 1 }).lean()

    return NextResponse.json({
      success: true,
      data: menuItems,
      count: menuItems.length,
      filters: category ? { category } : {},
    })
  } catch (error) {
    console.error('Error fetching menu items:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch menu items',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}
