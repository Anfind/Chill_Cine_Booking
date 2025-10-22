import { NextRequest, NextResponse } from 'next/server'
import crypto from 'crypto'
import connectDB from '@/lib/mongodb'
import Booking from '@/lib/models/Booking'

export async function POST(request: NextRequest) {
  try {
    await connectDB()
    
    const body = await request.json()
    
    // 1. Extract IPN data
    const {
      accessKey,
      amount,
      extraData = '',
      message,
      orderId,
      orderInfo,
      orderType,
      partnerCode,
      payType,
      requestId,
      responseTime,
      resultCode,
      transId,
      m2signature
    } = body
    
    console.log('📨 Pay2S IPN Received:', {
      orderId,
      orderInfo,
      amount,
      resultCode,
      message,
      transId,
      payType,
      fullBody: JSON.stringify(body, null, 2)
    })
    
    // 2. Check resultCode FIRST before processing
    // resultCode: 0 or 9000 = SUCCESS, others = FAILED/PENDING
    if (resultCode !== 0 && resultCode !== 9000) {
      console.log(`⏭️  Skipping IPN - resultCode ${resultCode} is not success:`, message)
      return NextResponse.json({ 
        success: true,
        message: 'IPN received but payment not successful yet'
      })
    }
    
    // 3. Verify signature
    const secretKey = process.env.PAY2S_SECRET_KEY!
    
    const rawHash = `accessKey=${accessKey}&amount=${amount}&extraData=${extraData}&message=${message}&orderId=${orderId}&orderInfo=${orderInfo}&orderType=${orderType}&partnerCode=${partnerCode}&payType=${payType}&requestId=${requestId}&responseTime=${responseTime}&resultCode=${resultCode}&transId=${transId}`
    
    const expectedSignature = crypto
      .createHmac('sha256', secretKey)
      .update(rawHash)
      .digest('hex')
    
    if (m2signature !== expectedSignature) {
      console.error('❌ Invalid signature:', {
        received: m2signature.substring(0, 20) + '...',
        expected: expectedSignature.substring(0, 20) + '...'
      })
      return NextResponse.json(
        { error: 'Invalid signature' },
        { status: 400 }
      )
    }
    
    console.log('✅ Signature verified')
    
    // 4. Find booking by orderId (MongoDB _id)
    const booking = await Booking.findById(orderId)
    
    if (!booking) {
      console.error('❌ Booking not found:', orderId)
      return NextResponse.json(
        { error: 'Booking not found' },
        { status: 404 }
      )
    }
    
    // 4. Verify amount matches
    if (amount !== booking.pricing.total) {
      console.error('❌ Amount mismatch:', {
        expected: booking.pricing.total,
        received: amount
      })
      return NextResponse.json(
        { error: 'Amount mismatch' },
        { status: 400 }
      )
    }
    
    // 5. Check if already paid (prevent duplicate processing)
    if (booking.paymentStatus === 'paid') {
      console.log(`ℹ️  Booking ${booking.bookingCode} already marked as paid`)
      return NextResponse.json({ 
        success: true, 
        message: 'Booking already paid' 
      })
    }
    
    // 6. Update booking - Payment SUCCESS (resultCode already validated above)
    booking.paymentStatus = 'paid'
    booking.status = 'confirmed'
    booking.paymentMethod = 'bank'
    booking.paymentTransactionId = transId?.toString()
    
    await booking.save()
    
    console.log(`✅ Payment confirmed for booking ${booking.bookingCode}`, {
      bookingId: booking._id,
      transactionId: transId,
      amount: booking.pricing.total,
      resultCode
    })
    
    // TODO: Send confirmation email/SMS
    // await sendBookingConfirmation(booking)
    
    // 7. MUST respond with 200 OK + {success: true}
    // Pay2S will retry if not received within 30 seconds
    return NextResponse.json({ success: true })
    
  } catch (error: any) {
    console.error('❌ Pay2S IPN Error:', error)
    
    // Still return 200 to prevent retry if it's not recoverable
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// Handle OPTIONS for CORS (if needed)
export async function OPTIONS(request: NextRequest) {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  })
}
