import { NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import { City } from '@/lib/models'
import { withCache, cache, CacheTTL, CacheTags } from '@/lib/cache'
import { requireAdmin } from '@/lib/auth/admin'
import { errorResponse, successResponse } from '@/lib/api/response'

// Cache for 1 hour (cities don't change often)
export const revalidate = 3600

/**
 * GET /api/cities
 * Lấy danh sách tất cả cities (Tỉnh/Thành phố)
 * Query params:
 * - all=true: Lấy tất cả (bao gồm inactive) - dành cho admin
 * 
 * Cached for 1 hour
 */
export async function GET(request: Request) {
  try {
    await connectDB()

    const { searchParams } = new URL(request.url)
    const showAll = searchParams.get('all') === 'true'

    // Cache key based on query params
    const cacheKey = `cities:${showAll ? 'all' : 'active'}`

    const cities = await withCache(
      cacheKey,
      async () => {
        const query = showAll ? {} : { isActive: true }
        return await City.find(query)
          .select('_id code name slug isActive displayOrder')
          .sort({ displayOrder: 1 })
          .lean()
      },
      CacheTTL.ONE_HOUR,
      [CacheTags.CITIES]
    )

    return NextResponse.json(
      {
        success: true,
        data: cities,
        count: cities.length,
      },
      {
        headers: {
          'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=7200',
        },
      }
    )
  } catch (error) {
    console.error('Error fetching cities:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch cities',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}

/**
 * POST /api/cities
 * Tạo city mới (ADMIN ONLY)
 */
export async function POST(request: Request) {
  try {
    // 1. Check admin authentication
    const adminCheck = await requireAdmin()
    if (adminCheck) return adminCheck

    // 2. Connect to database
    await connectDB()

    const body = await request.json()
    const { code, name, slug, isActive, displayOrder } = body

    // 3. Validation
    if (!code || !name) {
      return errorResponse(new Error('Code và Name là bắt buộc'), 400)
    }

    // 4. Check duplicate code
    const existingCity = await City.findOne({ code: code.toLowerCase() })
    if (existingCity) {
      return errorResponse(new Error('Mã tỉnh thành đã tồn tại'), 409)
    }

    // 5. Auto-generate slug if not provided
    const citySlug = slug || name.toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '') // Remove diacritics
      .replace(/đ/g, 'd')
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim()

    // 6. Create city
    const city = await City.create({
      code: code.toLowerCase(),
      name,
      slug: citySlug,
      isActive: isActive !== undefined ? isActive : true,
      displayOrder: displayOrder || 0,
    })

    // 7. Invalidate cache
    cache.clearByTag(CacheTags.CITIES)

    // 8. Return success response
    return successResponse(city, 'Tạo tỉnh thành thành công', 201)
  } catch (error) {
    return errorResponse(error)
  }
}

