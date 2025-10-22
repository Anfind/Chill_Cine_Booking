import { NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import { MenuItem } from '@/lib/models'

export const dynamic = 'force-dynamic'

/**
 * GET /api/menu-items?category=drink
 * Lấy danh sách menu items (dịch vụ thêm)
 */
export async function GET(request: Request) {
  try {
    await connectDB()

    const { searchParams } = new URL(request.url)
    const category = searchParams.get('category')

    let query: any = {}
    
    if (category) {
      query.category = category
    }

    const menuItems = await MenuItem.find(query)
      .sort({ displayOrder: 1, name: 1 })
      .lean()

    return NextResponse.json({
      success: true,
      data: menuItems,
      count: menuItems.length,
      filters: { category },
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

/**
 * POST /api/menu-items
 * Tạo menu item mới
 */
export async function POST(request: Request) {
  try {
    await connectDB()
    const body = await request.json()

    // Validation
    if (!body.name || !body.category || body.price === undefined) {
      return NextResponse.json(
        {
          success: false,
          error: 'Missing required fields: name, category, price',
        },
        { status: 400 }
      )
    }

    // Validate category
    const validCategories = ['drink', 'snack', 'food', 'extra']
    if (!validCategories.includes(body.category)) {
      return NextResponse.json(
        { success: false, error: 'Invalid category' },
        { status: 400 }
      )
    }

    const menuItem = await MenuItem.create({
      name: body.name,
      price: body.price,
      category: body.category,
      image: body.image || '',
      description: body.description || '',
      displayOrder: body.displayOrder || 0,
      isAvailable: body.isAvailable !== undefined ? body.isAvailable : true,
    })

    return NextResponse.json(
      {
        success: true,
        data: menuItem,
        message: 'Menu item created successfully',
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('Error creating menu item:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to create menu item',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}
