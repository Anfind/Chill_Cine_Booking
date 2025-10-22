import { NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import { MenuItem } from '@/lib/models'

export const dynamic = 'force-dynamic'

/**
 * GET /api/menu-items/[itemId]
 * Lấy thông tin chi tiết 1 menu item
 */
export async function GET(
  request: Request,
  { params }: { params: Promise<{ itemId: string }> }
) {
  try {
    await connectDB()
    const { itemId } = await params

    const menuItem = await MenuItem.findById(itemId).lean()

    if (!menuItem) {
      return NextResponse.json(
        { success: false, error: 'Menu item not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      data: menuItem,
    })
  } catch (error) {
    console.error('Error fetching menu item:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch menu item',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}

/**
 * PUT /api/menu-items/[itemId]
 * Cập nhật thông tin menu item
 */
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ itemId: string }> }
) {
  try {
    await connectDB()
    const { itemId } = await params
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

    // Check if menu item exists
    const existingItem = await MenuItem.findById(itemId)
    if (!existingItem) {
      return NextResponse.json(
        { success: false, error: 'Menu item not found' },
        { status: 404 }
      )
    }

    // Update menu item
    const updatedItem = await MenuItem.findByIdAndUpdate(
      itemId,
      {
        name: body.name,
        price: body.price,
        category: body.category,
        image: body.image || '',
        description: body.description || '',
        displayOrder: body.displayOrder || 0,
        isAvailable: body.isAvailable !== undefined ? body.isAvailable : true,
      },
      { new: true }
    ).lean()

    return NextResponse.json({
      success: true,
      data: updatedItem,
      message: 'Menu item updated successfully',
    })
  } catch (error) {
    console.error('Error updating menu item:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to update menu item',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}

/**
 * DELETE /api/menu-items/[itemId]
 * Xóa menu item (hard delete vì không có isActive field)
 */
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ itemId: string }> }
) {
  try {
    await connectDB()
    const { itemId } = await params

    // Check if menu item exists
    const existingItem = await MenuItem.findById(itemId)
    if (!existingItem) {
      return NextResponse.json(
        { success: false, error: 'Menu item not found' },
        { status: 404 }
      )
    }

    // Set isAvailable to false (soft delete)
    await MenuItem.findByIdAndUpdate(itemId, {
      isAvailable: false,
    })

    return NextResponse.json({
      success: true,
      message: 'Menu item deleted successfully',
    })
  } catch (error) {
    console.error('Error deleting menu item:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to delete menu item',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}
