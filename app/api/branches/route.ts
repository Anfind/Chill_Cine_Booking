import { NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import { Branch, City } from '@/lib/models'
import { withCache, cache, CacheTTL, CacheTags } from '@/lib/cache'

// Cache for 30 minutes
export const revalidate = 1800

/**
 * GET /api/branches?cityId=xxx
 * Lấy danh sách branches theo cityId
 * Nếu không có cityId, trả về tất cả branches
 * 
 * Cached for 30 minutes
 */
export async function GET(request: Request) {
  try {
    await connectDB()

    const { searchParams } = new URL(request.url)
    const cityId = searchParams.get('cityId')

    // Cache key based on query params
    const cacheKey = `branches:${cityId || 'all'}`

    const branches = await withCache(
      cacheKey,
      async () => {
        let query: any = { isActive: true }
        if (cityId) {
          query.cityId = cityId
        }

        return await Branch.find(query)
          .populate('cityId', 'name code')
          .select('_id name cityId address phone slug openingHours amenities images isActive')
          .sort({ name: 1 })
          .lean()
      },
      CacheTTL.THIRTY_MINUTES,
      [CacheTags.BRANCHES]
    )

    return NextResponse.json(
      {
        success: true,
        data: branches,
        count: branches.length,
        filters: cityId ? { cityId } : {},
      },
      {
        headers: {
          'Cache-Control': 'public, s-maxage=1800, stale-while-revalidate=3600',
        },
      }
    )
  } catch (error) {
    console.error('Error fetching branches:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch branches',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}

/**
 * POST /api/branches
 * Tạo branch mới
 */
export async function POST(request: Request) {
  try {
    await connectDB()
    const body = await request.json()

    // Validation
    if (!body.name || !body.cityId || !body.address) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Missing required fields',
          message: 'name, cityId, and address are required' 
        },
        { status: 400 }
      )
    }

    // Generate slug from name
    const slug = body.name
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '')

    const branch = await Branch.create({
      name: body.name,
      cityId: body.cityId,
      address: body.address,
      phone: body.phone || '',
      slug,
      isActive: true,
    })

    const populatedBranch = await Branch.findById(branch._id)
      .populate('cityId', 'name code')
      .lean()

    // Invalidate cache
    cache.clearByTag(CacheTags.BRANCHES)

    return NextResponse.json({
      success: true,
      data: populatedBranch,
      message: 'Branch created successfully',
    }, { status: 201 })
  } catch (error) {
    console.error('Error creating branch:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to create branch',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}
