import { NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import { City } from '@/lib/models'

export const dynamic = 'force-dynamic'

/**
 * GET /api/cities
 * Lấy danh sách tất cả cities (Tỉnh/Thành phố)
 * Query params:
 * - all=true: Lấy tất cả (bao gồm inactive) - dành cho admin
 */
export async function GET(request: Request) {
  try {
    await connectDB()

    const { searchParams } = new URL(request.url)
    const showAll = searchParams.get('all') === 'true'

    const query = showAll ? {} : { isActive: true }
    const cities = await City.find(query).sort({ displayOrder: 1 }).lean()

    return NextResponse.json({
      success: true,
      data: cities,
      count: cities.length,
    })
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
 * Tạo city mới
 */
export async function POST(request: Request) {
  try {
    await connectDB()

    const body = await request.json()
    const { code, name, slug, isActive, displayOrder } = body

    // Validation
    if (!code || !name) {
      return NextResponse.json(
        {
          success: false,
          error: 'Code và Name là bắt buộc',
        },
        { status: 400 }
      )
    }

    // Check duplicate code
    const existingCity = await City.findOne({ code: code.toLowerCase() })
    if (existingCity) {
      return NextResponse.json(
        {
          success: false,
          error: 'Mã tỉnh thành đã tồn tại',
        },
        { status: 400 }
      )
    }

    // Auto-generate slug if not provided
    const citySlug = slug || name.toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '') // Remove diacritics
      .replace(/đ/g, 'd')
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim()

    const city = await City.create({
      code: code.toLowerCase(),
      name,
      slug: citySlug,
      isActive: isActive !== undefined ? isActive : true,
      displayOrder: displayOrder || 0,
    })

    return NextResponse.json({
      success: true,
      data: city,
      message: 'Tạo tỉnh thành thành công',
    })
  } catch (error) {
    console.error('Error creating city:', error)
    
    // Handle duplicate slug error
    if (error instanceof Error && error.message.includes('duplicate key')) {
      return NextResponse.json(
        {
          success: false,
          error: 'Slug hoặc Code đã tồn tại',
        },
        { status: 400 }
      )
    }

    return NextResponse.json(
      {
        success: false,
        error: 'Lỗi khi tạo tỉnh thành',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}
