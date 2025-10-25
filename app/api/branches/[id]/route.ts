import { NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import { Branch, City } from '@/lib/models'
import { cache, CacheTags, withCache, CacheTTL } from '@/lib/cache'
import { requireAdmin } from '@/lib/auth/admin'
import { errorResponse, successResponse, notFoundResponse } from '@/lib/api/response'

export const dynamic = 'force-dynamic'

/**
 * GET /api/branches/[id]
 * Lấy thông tin chi tiết một branch
 * 
 * Cached for 30 minutes
 */
export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    await connectDB()

    const { id } = await params

    // Cache key based on branch ID
    const cacheKey = `branch:${id}`

    const branch = await withCache(
      cacheKey,
      async () => {
        // Support both ObjectId and slug
        return await Branch.findOne({
          $or: [{ _id: id }, { slug: id }],
          isActive: true,
        })
          .populate('cityId', 'name code')
          .select('_id name cityId address phone slug openingHours amenities images isActive')
          .lean()
      },
      CacheTTL.THIRTY_MINUTES,
      [CacheTags.BRANCHES]
    )

    if (!branch) {
      return NextResponse.json(
        {
          success: false,
          error: 'Branch not found',
        },
        { status: 404 }
      )
    }

    return NextResponse.json(
      {
        success: true,
        data: branch,
      },
      {
        headers: {
          'Cache-Control': 'public, s-maxage=1800, stale-while-revalidate=3600',
        },
      }
    )
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
  // ✅ SECURITY: Require admin authentication
  const authError = await requireAdmin()
  if (authError) return authError

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
      return notFoundResponse('Branch not found')
    }

    // Invalidate cache
    cache.clearByTag(CacheTags.BRANCHES)

    return successResponse(branch, 'Branch updated successfully')
  } catch (error) {
    return errorResponse(error)
  }
}

/**
 * DELETE /api/branches/[id]
 * Xóa branch (soft delete)
 */
export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  // ✅ SECURITY: Require admin authentication
  const authError = await requireAdmin()
  if (authError) return authError

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
      return notFoundResponse('Branch not found')
    }

    // Invalidate cache
    cache.clearByTag(CacheTags.BRANCHES)

    return successResponse(null, 'Branch deleted successfully')
  } catch (error) {
    return errorResponse(error)
  }
}
