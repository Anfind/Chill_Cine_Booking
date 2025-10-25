import { NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import { ComboPackage } from '@/lib/models'
import { requireAdmin } from '@/lib/auth/admin'
import { errorResponse, successResponse, notFoundResponse } from '@/lib/api/response'

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
  // ✅ SECURITY: Require admin authentication
  const authError = await requireAdmin()
  if (authError) return authError

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
      return notFoundResponse('Combo not found')
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

    return successResponse(updatedCombo, 'Combo updated successfully')
  } catch (error) {
    return errorResponse(error)
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
  // ✅ SECURITY: Require admin authentication
  const authError = await requireAdmin()
  if (authError) return authError

  try {
    await connectDB()
    const { comboId } = await params

    // Check if combo exists
    const existingCombo = await ComboPackage.findById(comboId)
    if (!existingCombo) {
      return notFoundResponse('Combo not found')
    }

    // Soft delete
    await ComboPackage.findByIdAndUpdate(comboId, {
      isActive: false,
    })

    return successResponse(null, 'Combo deleted successfully')
  } catch (error) {
    return errorResponse(error)
  }
}

