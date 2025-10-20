import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import Booking from '@/lib/models/Booking'

export async function POST(request: NextRequest) {
  try {
    await connectDB()
    
    // 1. Verify Bearer token from header
    const authHeader = request.headers.get('authorization')
    
    if (!authHeader) {
      console.error('❌ Webhook: Missing authorization header')
      return NextResponse.json(
        { error: 'Missing authorization header' },
        { status: 401 }
      )
    }
    
    const token = authHeader.replace('Bearer ', '')
    const expectedToken = process.env.PAY2S_WEBHOOK_SECRET!
    
    if (token !== expectedToken) {
      console.error('❌ Webhook: Invalid token')
      return NextResponse.json(
        { error: 'Invalid token' },
        { status: 403 }
      )
    }
    
    console.log('✅ Webhook: Token verified')
    
    // 2. Parse transactions
    const body = await request.json()
    const { transactions } = body
    
    if (!transactions || !Array.isArray(transactions)) {
      console.error('❌ Webhook: Invalid payload')
      return NextResponse.json(
        { error: 'Invalid payload' },
        { status: 400 }
      )
    }
    
    console.log(`📨 Webhook: Received ${transactions.length} transaction(s)`)
    
    // 3. Process each transaction
    for (const tx of transactions) {
      console.log('Processing transaction:', {
        id: tx.id,
        gateway: tx.gateway,
        type: tx.transferType,
        amount: tx.transferAmount,
        content: tx.content
      })
      
      // Only process incoming transactions
      if (tx.transferType !== 'IN') {
        console.log('⏭️  Skipping OUT transaction')
        continue
      }
      
      // Extract booking code from transaction content
      const bookingCode = extractBookingCode(tx.content)
      
      if (!bookingCode) {
        console.warn(`⚠️  No booking code found in content: "${tx.content}"`)
        continue
      }
      
      console.log(`🔍 Looking for booking: ${bookingCode}`)
      
      // Find booking by bookingCode
      const booking = await Booking.findOne({ bookingCode })
      
      if (!booking) {
        console.warn(`⚠️  Booking not found: ${bookingCode}`)
        continue
      }
      
      // Verify amount
      if (tx.transferAmount !== booking.pricing.total) {
        console.error('❌ Amount mismatch:', {
          bookingCode,
          expected: booking.pricing.total,
          received: tx.transferAmount
        })
        continue
      }
      
      // Update booking if not already paid
      if (booking.paymentStatus !== 'paid') {
        booking.paymentStatus = 'paid'
        booking.status = 'confirmed'
        booking.paymentMethod = 'bank'
        booking.paymentTransactionId = tx.transactionNumber
        
        await booking.save()
        
        console.log(`✅ Webhook: Payment confirmed for ${bookingCode}`, {
          transactionId: tx.transactionNumber,
          gateway: tx.gateway
        })
        
        // TODO: Send confirmation
        // await sendBookingConfirmation(booking)
      } else {
        console.log(`ℹ️  Booking ${bookingCode} already paid`)
      }
    }
    
    // 4. Response
    return NextResponse.json({ success: true })
    
  } catch (error: any) {
    console.error('❌ Webhook Error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

/**
 * Extract booking code from transaction content
 * VD: "BK202510190001 GD 750915-101925 14:23:07" → "BK202510190001"
 * VD: "GP7O2HW8Y5 BK202510190002" → "BK202510190002"
 */
function extractBookingCode(content: string): string | null {
  // Pattern: BK + 12 digits
  const match = content.match(/BK\d{12}/)
  return match ? match[0] : null
}

// Handle OPTIONS for CORS (if needed)
export async function OPTIONS(request: NextRequest) {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  })
}
