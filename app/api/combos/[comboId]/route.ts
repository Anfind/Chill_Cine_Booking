import { NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import { ComboPackage } from '@/lib/models'

export const dynamic = 'force-dynamic'

/**
 * GET /api/combos/[comboId]
 * Lấy thông tin chi tiết 1 combo
 */
export async function GET(
  request: Request,
  { params }: { params: Promise<{ comboId: string }> }
) {
  try {
    await connectDB()

    const { comboId } = await params
    const combo = await ComboPackage.findById(comboId).lean()

    if (!combo) {
      return NextResponse.json(
        { success: false, error: 'Combo not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      data: combo,
    })
  } catch (error) {
    console.error('Error fetching combo:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch combo',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}

/**
 * PUT /api/combos/[comboId]
 * Cập nhật thông tin combo
 */
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ comboId: string }> }
) {
  try {
    await connectDB()
    const { comboId } = await params
    const body = await request.json()

    // Validation
    if (!body.name || !body.code || !body.duration || body.price === undefined) {
      return NextResponse.json(
        {
          success: false,
          error: 'Missing required fields: name, code, duration, price',
        },
        { status: 400 }
      )
    }

    // Check if combo exists
    const existingCombo = await ComboPackage.findById(comboId)
    if (!existingCombo) {
      return NextResponse.json(
        { success: false, error: 'Combo not found' },
        { status: 404 }
      )
    }

    // Check if code is taken by another combo
    const codeCheck = await ComboPackage.findOne({
      code: body.code.toLowerCase().trim(),
      _id: { $ne: comboId },
    })
    if (codeCheck) {
      return NextResponse.json(
        { success: false, error: 'Code already exists' },
        { status: 400 }
      )
    }

    // Update combo
    const updatedCombo = await ComboPackage.findByIdAndUpdate(
      comboId,
      {
        name: body.name,
        code: body.code.toLowerCase().trim(),
        duration: body.duration,
        price: body.price,
        description: body.description || '',
        isSpecial: body.isSpecial || false,
        timeRange: body.timeRange || undefined,
        extraFeePerHour: body.extraFeePerHour || 50000,
        displayOrder: body.displayOrder || 0,
        isActive: body.isActive !== undefined ? body.isActive : true,
      },
      { new: true }
    ).lean()

    return NextResponse.json({
      success: true,
      data: updatedCombo,
      message: 'Combo updated successfully',
    })
  } catch (error) {
    console.error('Error updating combo:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to update combo',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}

/**
 * DELETE /api/combos/[comboId]
 * Xóa combo (soft delete - set isActive = false)
 */
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ comboId: string }> }
) {
  try {
    await connectDB()
    const { comboId } = await params

    // Check if combo exists
    const existingCombo = await ComboPackage.findById(comboId)
    if (!existingCombo) {
      return NextResponse.json(
        { success: false, error: 'Combo not found' },
        { status: 404 }
      )
    }

    // Soft delete
    await ComboPackage.findByIdAndUpdate(comboId, {
      isActive: false,
    })

    return NextResponse.json({
      success: true,
      message: 'Combo deleted successfully',
    })
  } catch (error) {
    console.error('Error deleting combo:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to delete combo',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}
