import { NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import { Branch, City } from '@/lib/models'

export const dynamic = 'force-dynamic'

/**
 * GET /api/branches?cityId=xxx
 * Lấy danh sách branches theo cityId
 * Nếu không có cityId, trả về tất cả branches
 */
export async function GET(request: Request) {
  try {
    await connectDB()

    const { searchParams } = new URL(request.url)
    const cityId = searchParams.get('cityId')

    let query: any = { isActive: true }
    if (cityId) {
      query.cityId = cityId
    }

    const branches = await Branch.find(query)
      .populate('cityId', 'name code')
      .sort({ name: 1 })
      .lean()

    return NextResponse.json({
      success: true,
      data: branches,
      count: branches.length,
      filters: cityId ? { cityId } : {},
    })
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
