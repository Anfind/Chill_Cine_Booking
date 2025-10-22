import { NextResponse } from 'next/server'
import { getCronJobsStatus } from '@/lib/cron'

/**
 * GET /api/cron/status
 * 
 * Check status của cron jobs
 * Endpoint này dùng để debug và monitor
 */
export async function GET(request: Request) {
  try {
    // Security: Optional authentication check
    const authHeader = request.headers.get('authorization')
    const cronSecret = process.env.CRON_SECRET || 'default-cron-secret-change-me'
    
    // Chỉ cho phép truy cập nếu có authorization header hoặc đang ở development
    const isDev = process.env.NODE_ENV === 'development'
    const isAuthorized = authHeader === `Bearer ${cronSecret}`
    
    if (!isDev && !isAuthorized) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Unauthorized' 
        },
        { status: 401 }
      )
    }

    const status = getCronJobsStatus()

    return NextResponse.json({
      success: true,
      status,
      environment: process.env.NODE_ENV,
      timestamp: new Date().toISOString(),
    })

  } catch (error) {
    console.error('❌ Error getting cron status:', error)
    
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to get cron status',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}
