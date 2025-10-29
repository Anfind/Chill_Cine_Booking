import { NextRequest, NextResponse } from 'next/server'
import { TTLockService } from '@/lib/ttlock/service'
import { TTLockCredentials } from '@/lib/ttlock/types'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { mode, credentials } = body as {
      mode: 'mock' | 'real'
      credentials: TTLockCredentials
    }

    const service = new TTLockService(mode)

    if (mode === 'mock') {
      // Return mock token immediately
      const mockToken = await service.getAccessToken(credentials)
      return NextResponse.json({
        success: true,
        data: mockToken,
        mode: 'mock',
      })
    }

    // Real mode - validate inputs
    if (!credentials.username || !credentials.password) {
      return NextResponse.json(
        { error: 'Username and password are required for real mode' },
        { status: 400 }
      )
    }

    if (!credentials.clientId || !credentials.clientSecret) {
      return NextResponse.json(
        { error: 'Client ID and Client Secret are required' },
        { status: 400 }
      )
    }

    // Call real TTLock API
    const tokenData = await service.getAccessToken(credentials)

    return NextResponse.json({
      success: true,
      data: tokenData,
      mode: 'real',
    })
  } catch (error: any) {
    console.error('Error getting TTLock token:', error)
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Failed to get access token',
      },
      { status: 500 }
    )
  }
}
