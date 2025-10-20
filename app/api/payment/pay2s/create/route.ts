import { NextResponse } from 'next/server'
import crypto from 'crypto'
import connectDB from '@/lib/mongodb'
import Booking from '@/lib/models/Booking'

// Helper function to get Bank BIN code
function getBankBIN(bankCode: string): string {
  const bankBINs: Record<string, string> = {
    'VCB': '970436',   // Vietcombank
    'TCB': '970407',   // Techcombank
    'ACB': '970416',   // ACB
    'VBA': '970405',   // Agribank
    'BIDV': '970418',  // BIDV
    'VIB': '970441',   // VIB
    'MB': '970422',    // MBBank
    'SCB': '970429',   // Sacombank
    'VPB': '970432',   // VPBank
    'TPB': '970423',   // TPBank
    'SHB': '970443',   // SHB
    'EIB': '970431',   // Eximbank
    'MSB': '970426',   // MSB
    'OCB': '970448',   // OCB
    'VAB': '970427',   // VietABank
    'NAB': '970428',   // NamABank
    'PGB': '970430',   // PGBank
    'SEAB': '970440',  // SeABank
    'ABB': '970425',   // ABBank
    'LPB': '970449',   // LienVietPostBank
  }
  
  return bankBINs[bankCode] || bankCode
}

export async function POST(request: Request) {
  try {
    await connectDB()
    
    const { bookingId } = await request.json()
    
    if (!bookingId) {
      return NextResponse.json(
        { error: 'Missing bookingId' },
        { status: 400 }
      )
    }
    
    // 1. Fetch booking details
    const booking = await Booking.findById(bookingId).populate('roomId')
    
    if (!booking) {
      return NextResponse.json(
        { error: 'Booking not found' },
        { status: 404 }
      )
    }
    
    // 2. Prepare Pay2S request parameters
    const partnerCode = process.env.PAY2S_PARTNER_CODE!
    const accessKey = process.env.PAY2S_ACCESS_KEY!
    const secretKey = process.env.PAY2S_SECRET_KEY!
    const requestId = Date.now().toString()
    const orderId = (booking._id as any).toString()
    const amount = booking.pricing.total
    const orderInfo = booking.bookingCode // VD: BK202510190001
    const requestType = 'pay2s'
    const redirectUrl = process.env.PAY2S_REDIRECT_URL!
    const ipnUrl = process.env.PAY2S_IPN_URL!
    
    const bankAccounts = [
      {
        account_number: process.env.PAY2S_ACCOUNT_NUMBER!,
        bank_id: process.env.PAY2S_BANK_CODE!
      }
    ]
    
    // 3. Generate HMAC SHA256 signature
    const rawHash = `accessKey=${accessKey}&amount=${amount}&bankAccounts=Array&ipnUrl=${ipnUrl}&orderId=${orderId}&orderInfo=${orderInfo}&partnerCode=${partnerCode}&redirectUrl=${redirectUrl}&requestId=${requestId}&requestType=${requestType}`
    
    const signature = crypto
      .createHmac('sha256', secretKey)
      .update(rawHash)
      .digest('hex')
    
    console.log('📝 Pay2S Create Payment Request:', {
      orderId,
      amount,
      orderInfo,
      rawHash: rawHash.substring(0, 100) + '...',
      signature: signature.substring(0, 20) + '...',
      apiUrl: `${process.env.PAY2S_API_URL}/create`
    })
    
    // 4. Prepare request payload
    const payload = {
      accessKey,
      partnerCode,
      partnerName: 'Chill Cine Booking',
      requestId,
      amount,
      orderId,
      orderInfo,
      orderType: requestType,
      bankAccounts,
      redirectUrl,
      ipnUrl,
      requestType,
      signature
    }

    console.log('📤 Sending to Pay2S:', JSON.stringify(payload, null, 2))
    
    // 5. Call Pay2S Collection Link API
    console.log('🔄 Calling Pay2S API...')
    
    const response = await fetch(`${process.env.PAY2S_API_URL}/create`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload)
    })
    
    console.log('📥 Pay2S Response Status:', response.status)
    
    const data = await response.json()
    console.log('📥 Pay2S Response Data:', JSON.stringify(data, null, 2))
    
    if (!response.ok || data.resultCode !== 0) {
      console.error('❌ Pay2S API Error:', data)
      throw new Error(data.message || `Pay2S API error: ${data.resultCode}`)
    }
    
    console.log('✅ Pay2S Payment Link Created:', {
      transId: data.transId,
      payUrl: data.payUrl,
      qrCode: data.qrCode ? 'Yes' : 'No'
    })
    
    // 6. Save transaction ID to booking (only if exists)
    if (data.transId) {
      booking.paymentTransactionId = data.transId.toString()
      await booking.save()
    }
    
    // 7. Generate VietQR Banking QR Code
    // VietQR API: https://api.vietqr.io/v2/generate
    // This creates a QR code that works with banking apps
    const vietQRPayload = {
      accountNo: process.env.PAY2S_ACCOUNT_NUMBER,
      accountName: process.env.PAY2S_ACCOUNT_NAME,
      acqId: getBankBIN(process.env.PAY2S_BANK_CODE || 'ACB'), // ACB BIN
      amount: booking.pricing.total.toString(),
      addInfo: booking.bookingCode,
      format: "text",
      template: "compact2"
    }

    console.log('🎯 Creating VietQR with payload:', vietQRPayload)

    let vietQRUrl = null
    try {
      const vietQRResponse = await fetch('https://api.vietqr.io/v2/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(vietQRPayload)
      })
      
      const vietQRData = await vietQRResponse.json()
      
      if (vietQRData.code === '00' && vietQRData.data?.qrDataURL) {
        vietQRUrl = vietQRData.data.qrDataURL
        console.log('✅ VietQR generated successfully')
      } else {
        console.warn('⚠️  VietQR API error:', vietQRData)
        // Fallback to image URL method
        vietQRUrl = `https://img.vietqr.io/image/${process.env.PAY2S_BANK_CODE}-${process.env.PAY2S_ACCOUNT_NUMBER}-compact2.jpg?amount=${booking.pricing.total}&addInfo=${encodeURIComponent(booking.bookingCode)}&accountName=${encodeURIComponent(process.env.PAY2S_ACCOUNT_NAME || '')}`
      }
    } catch (error) {
      console.error('❌ VietQR generation error:', error)
      // Fallback to image URL method
      vietQRUrl = `https://img.vietqr.io/image/${process.env.PAY2S_BANK_CODE}-${process.env.PAY2S_ACCOUNT_NUMBER}-compact2.jpg?amount=${booking.pricing.total}&addInfo=${encodeURIComponent(booking.bookingCode)}&accountName=${encodeURIComponent(process.env.PAY2S_ACCOUNT_NAME || '')}`
    }
    
    // Use VietQR (always), not Pay2S payUrl
    const qrCodeUrl = vietQRUrl
    
    // 8. Return payment details to frontend
    return NextResponse.json({
      success: true,
      qrCode: qrCodeUrl,
      qrUrl: qrCodeUrl,
      payUrl: data.payUrl, // Keep Pay2S URL for reference
      transactionId: data.transId || requestId,
      amount: booking.pricing.total,
      bookingCode: booking.bookingCode,
      expiredAt: data.expiredAt,
      bankInfo: {
        bank: process.env.PAY2S_BANK_CODE,
        accountNumber: process.env.PAY2S_ACCOUNT_NUMBER,
        accountName: process.env.PAY2S_ACCOUNT_NAME,
      }
    })
    
  } catch (error: any) {
    console.error('❌ Pay2S Create Error:', error)
    return NextResponse.json(
      { 
        error: error.message || 'Failed to create payment',
        details: error.stack
      },
      { status: 500 }
    )
  }
}
