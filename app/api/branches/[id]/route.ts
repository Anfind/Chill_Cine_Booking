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

/**
 * PUT /api/branches/[id]
 * Cập nhật thông tin branch
 */
export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    await connectDB()
    const { id } = await params
    const body = await request.json()

    // Update slug if name changed
    if (body.name) {
      body.slug = body.name
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '')
    }

    const branch = await Branch.findByIdAndUpdate(
      id,
      { $set: body },
      { new: true, runValidators: true }
    ).populate('cityId', 'name code')

    if (!branch) {
      return NextResponse.json(
        { success: false, error: 'Branch not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      data: branch,
      message: 'Branch updated successfully',
    })
  } catch (error) {
    console.error('Error updating branch:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to update branch',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}

/**
 * DELETE /api/branches/[id]
 * Xóa branch (soft delete)
 */
export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    await connectDB()
    const { id } = await params

    // Soft delete: set isActive = false
    const branch = await Branch.findByIdAndUpdate(
      id,
      { isActive: false },
      { new: true }
    )

    if (!branch) {
      return NextResponse.json(
        { success: false, error: 'Branch not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Branch deleted successfully',
      data: branch,
    })
  } catch (error) {
    console.error('Error deleting branch:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to delete branch',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}
