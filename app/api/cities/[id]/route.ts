import { NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import { City, Branch } from '@/lib/models'
import { cache, CacheTags } from '@/lib/cache'
import { requireAdmin } from '@/lib/auth/admin'
import { errorResponse, successResponse, notFoundResponse } from '@/lib/api/response'

export const dynamic = 'force-dynamic'

/**
 * GET /api/cities/[id]
 * Lấy thông tin chi tiết một city
 */
export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    await connectDB()
    const { id } = await params

    const city = await City.findById(id).lean()

    if (!city) {
      return NextResponse.json(
        {
          success: false,
          error: 'Không tìm thấy tỉnh thành',
        },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      data: city,
    })
  } catch (error) {
    console.error('Error fetching city:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Lỗi khi lấy thông tin tỉnh thành',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}

/**
 * PUT /api/cities/[id]
 * Cập nhật thông tin city
 */
export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  // ✅ SECURITY: Require admin authentication
  const authError = await requireAdmin()
  if (authError) return authError

  try {
    await connectDB()
    const { id } = await params

    const body = await request.json()
    const { code, name, slug, isActive, displayOrder } = body

    // Validation
    if (!name) {
      return NextResponse.json(
        {
          success: false,
          error: 'Tên tỉnh thành là bắt buộc',
        },
        { status: 400 }
      )
    }

    // Check if city exists
    const existingCity = await City.findById(id)
    if (!existingCity) {
      return notFoundResponse('Không tìm thấy tỉnh thành')
    }

    // Check duplicate code (nếu code thay đổi)
    if (code && code !== existingCity.code) {
      const duplicateCode = await City.findOne({ 
        code: code.toLowerCase(),
        _id: { $ne: id }
      })
      if (duplicateCode) {
        return NextResponse.json(
          {
            success: false,
            error: 'Mã tỉnh thành đã tồn tại',
          },
          { status: 400 }
        )
      }
    }

    // Update fields
    if (code) existingCity.code = code.toLowerCase()
    if (name) existingCity.name = name
    if (slug) existingCity.slug = slug.toLowerCase()
    if (isActive !== undefined) existingCity.isActive = isActive
    if (displayOrder !== undefined) existingCity.displayOrder = displayOrder

    await existingCity.save()

    // Invalidate cache
    cache.clearByTag(CacheTags.CITIES)

    return successResponse(existingCity, 'Cập nhật tỉnh thành thành công')
  } catch (error) {
    return errorResponse(error)
  }
}

/**
 * DELETE /api/cities/[id]
 * Xóa city (chỉ xóa nếu không còn branch nào)
 */
export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  // ✅ SECURITY: Require admin authentication
  const authError = await requireAdmin()
  if (authError) return authError

  try {
    await connectDB()
    const { id } = await params

    // Check if city exists
    const city = await City.findById(id)
    if (!city) {
      return notFoundResponse('Không tìm thấy tỉnh thành')
    }

    // Check if city has any branches
    const branchCount = await Branch.countDocuments({ cityId: id })
    if (branchCount > 0) {
      return NextResponse.json(
        {
          success: false,
          error: `Không thể xóa tỉnh thành đang có ${branchCount} chi nhánh`,
          branchCount,
        },
        { status: 400 }
      )
    }

    await City.findByIdAndDelete(id)

    // Invalidate cache
    cache.clearByTag(CacheTags.CITIES)

    return successResponse(null, 'Xóa tỉnh thành thành công')
  } catch (error) {
    return errorResponse(error)
  }
}
