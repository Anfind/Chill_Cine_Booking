import { NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import { ComboPackage } from '@/lib/models'

export const dynamic = 'force-dynamic'

/**
 * GET /api/combos
 * Lấy danh sách tất cả combo packages
 */
export async function GET() {
  try {
    await connectDB()

    // Admin có thể xem tất cả (kể cả inactive), user chỉ xem active
    const combos = await ComboPackage.find().sort({ displayOrder: 1, name: 1 }).lean()

    return NextResponse.json({
      success: true,
      data: combos,
      count: combos.length,
    })
  } catch (error) {
    console.error('Error fetching combo packages:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch combo packages',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}

/**
 * POST /api/combos
 * Tạo combo package mới
 */
export async function POST(request: Request) {
  try {
    await connectDB()
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

    // Check if code already exists
    const existingCombo = await ComboPackage.findOne({ code: body.code.toLowerCase().trim() })
    if (existingCombo) {
      return NextResponse.json(
        { success: false, error: 'Code already exists' },
        { status: 400 }
      )
    }

    const combo = await ComboPackage.create({
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
    })

    return NextResponse.json(
      {
        success: true,
        data: combo,
        message: 'Combo created successfully',
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('Error creating combo:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to create combo',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}
