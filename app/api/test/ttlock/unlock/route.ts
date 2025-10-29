import { NextRequest, NextResponse } from 'next/server'
import { TTLockService } from '@/lib/ttlock/service'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { mode, lockId, accessToken, clientId } = body

    if (!lockId) {
      return NextResponse.json({ error: 'Lock ID is required' }, { status: 400 })
    }

    const service = new TTLockService(mode)
    const startTime = Date.now()

    // Unlock door
    const result = await service.unlockDoor(
      parseInt(lockId),
      accessToken,
      clientId
    )

    const responseTime = Date.now() - startTime

    return NextResponse.json({
      success: result.errcode === 0,
      data: result,
      responseTime,
      mode,
    })
  } catch (error: any) {
    console.error('Error unlocking door:', error)
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Failed to unlock door',
      },
      { status: 500 }
    )
  }
}
