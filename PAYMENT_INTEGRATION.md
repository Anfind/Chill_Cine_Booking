# 💳 Tích hợp Pay2S Payment Gateway

## 📚 Mục lục

- [Tổng quan](#tổng-quan)
- [Kiến trúc hệ thống](#kiến-trúc-hệ-thống)
- [Cài đặt & Cấu hình](#cài-đặt--cấu-hình)
- [API Endpoints](#api-endpoints)
- [Flow thanh toán](#flow-thanh-toán)
- [Testing](#testing)
- [Troubleshooting](#troubleshooting)

---

## 🎯 Tổng quan

### Pay2S là gì?

**Pay2S** là giải pháp thanh toán tự động qua **chuyển khoản ngân hàng** (Open Banking API), cho phép:
- ✅ Nhận tiền trực tiếp về tài khoản ngân hàng
- ✅ Không cần ĐKKD (phù hợp cá nhân/startup)
- ✅ Phí 0đ/giao dịch (chỉ phí API ~100k/tháng)
- ✅ QR Code VietQR động cho từng đơn hàng
- ✅ Webhook real-time khi có tiền vào

### Tại sao chọn Pay2S cho Booking App?

| Tiêu chí | Pay2S | VNPay/MoMo |
|----------|-------|------------|
| **ĐKKD** | ❌ Không cần | ✅ Bắt buộc |
| **Phí GD** | 0đ | 1.5-2.5% |
| **Tiền về** | Ngay TK | 1-3 ngày |
| **Giới hạn** | Không | Có limit |
| **QR động** | ✅ Mỗi booking 1 mã | ✅ |

---

## 🏗️ Kiến trúc hệ thống

### Cơ chế hoạt động

```
┌─────────────────────────────────────────────────────────────────┐
│                    BOOKING APP FLOW                              │
└─────────────────────────────────────────────────────────────────┘

USER                  FRONTEND              BACKEND              PAY2S              BANK
  │                      │                     │                   │                  │
  │  1. Book phòng       │                     │                   │                  │
  ├────────────────────>│                     │                   │                  │
  │                      │  2. POST /bookings  │                   │                  │
  │                      ├────────────────────>│                   │                  │
  │                      │                     │  3. Tạo booking   │                  │
  │                      │                     │  status: pending  │                  │
  │                      │                     │  paymentStatus:   │                  │
  │                      │<────────────────────┤     unpaid        │                  │
  │                      │  bookingId          │                   │                  │
  │                      │                     │                   │                  │
  │  4. Redirect to      │                     │                   │                  │
  │     /payment         │                     │                   │                  │
  │<─────────────────────┤                     │                   │                  │
  │                      │                     │                   │                  │
  │  5. Load payment     │                     │                   │                  │
  │     page             │                     │                   │                  │
  │                      │  6. Create QR       │                   │                  │
  │                      ├────────────────────>│                   │                  │
  │                      │                     │  7. Collection    │                  │
  │                      │                     │     Link API      │                  │
  │                      │                     ├──────────────────>│                  │
  │                      │                     │                   │  8. Gen QR       │
  │                      │                     │<──────────────────┤     VietQR       │
  │                      │  9. QR Code URL     │  payUrl, qrCode   │                  │
  │                      │<────────────────────┤                   │                  │
  │  10. Display QR      │                     │                   │                  │
  │<─────────────────────┤                     │                   │                  │
  │                      │                     │                   │                  │
  │  11. Quét QR         │                     │                   │                  │
  │  bằng app bank       │                     │                   │                  │
  ├─────────────────────────────────────────────────────────────────────────────────>│
  │                      │                     │                   │  12. Chuyển tiền │
  │                      │                     │                   │<─────────────────┤
  │                      │                     │                   │  (nội dung CK:   │
  │                      │                     │                   │   BK2025...)     │
  │                      │                     │                   │                  │
  │                      │                     │  13. IPN Webhook  │                  │
  │                      │                     │<──────────────────┤                  │
  │                      │                     │  (instant notify) │                  │
  │                      │                     │                   │                  │
  │                      │                     │  14. Verify       │                  │
  │                      │                     │      signature    │                  │
  │                      │                     │  15. Update DB    │                  │
  │                      │                     │      status:      │                  │
  │                      │                     │        confirmed  │                  │
  │                      │                     │      payment:     │                  │
  │                      │                     │        paid       │                  │
  │                      │                     │                   │                  │
  │                      │                     │  16. Response     │                  │
  │                      │                     ├──────────────────>│                  │
  │                      │                     │  200 OK           │                  │
  │                      │                     │  {success: true}  │                  │
  │                      │                     │                   │                  │
  │  17. Poll status     │                     │                   │                  │
  │     (mỗi 3s)         │                     │                   │                  │
  │                      ├────────────────────>│                   │                  │
  │                      │  GET /bookings/:id  │                   │                  │
  │                      │<────────────────────┤                   │                  │
  │  18. Status: paid    │  paymentStatus:     │                   │                  │
  │<─────────────────────┤    paid             │                   │                  │
  │                      │                     │                   │                  │
  │  19. Show success    │                     │                   │                  │
  │      animation       │                     │                   │                  │
  │                      │                     │                   │                  │
```

### 2 Cơ chế chính

#### 🔷 Collection Link API (Dùng cho Booking App)
- **Mục đích:** Tạo QR Code riêng cho từng đơn hàng
- **Flow:** Tạo booking → Gọi API → Nhận QR → User quét → IPN callback
- **Bảo mật:** HMAC SHA256 signature

#### 🔷 Webhook (Backup & Đối soát)
- **Mục đích:** Nhận biết MỌI giao dịch vào tài khoản
- **Flow:** Có tiền vào TK → Pay2S BOT phát hiện → Gửi webhook
- **Bảo mật:** Bearer Token authentication

---

## 🛠️ Cài đặt & Cấu hình

### Bước 1: Environment Variables

Tạo/cập nhật file `.env.local`:

```bash
# Pay2S Configuration
PAY2S_PARTNER_CODE=PAY2S72MLKFJFURCGPEM
PAY2S_ACCESS_KEY=66e862c89d4d4d1f34063dc1967fbd64dece4da3cba90af65167fbb8503b2eb3
PAY2S_SECRET_KEY=your_secret_key_here
PAY2S_API_URL=https://payment.pay2s.vn/v1/gateway/api
PAY2S_WEBHOOK_SECRET=your_webhook_secret_here

# Your Bank Info (để tạo QR Code)
PAY2S_BANK_CODE=VCB
PAY2S_ACCOUNT_NUMBER=1234567890
PAY2S_ACCOUNT_NAME=NGUYEN VAN A

# App URLs
NEXT_PUBLIC_APP_URL=http://localhost:3000
PAY2S_REDIRECT_URL=http://localhost:3000/payment/success
PAY2S_IPN_URL=http://localhost:3000/api/payment/pay2s/ipn

# Sandbox (for testing)
# PAY2S_API_URL=https://sandbox-payment.pay2s.vn/v1/gateway/api
```

**⚠️ Lưu ý bảo mật:**
- ❌ **KHÔNG BAO GIỜ** commit file `.env.local`
- ❌ **KHÔNG BAO GIỜ** public `SECRET_KEY` ra frontend
- ✅ Add `.env.local` vào `.gitignore`

### Bước 2: Cài đặt Dependencies

Không cần cài thêm package, sử dụng built-in Node.js `crypto`:

```typescript
import crypto from 'crypto'
```

### Bước 3: Cấu hình Pay2S Dashboard

1. **Lấy API Keys:**
   - Vào https://my.pay2s.vn/payment-intergration-center
   - Copy `Partner Code`, `Access Key`, `Secret Key`

2. **Setup Webhook (Optional cho backup):**
   - Vào https://my.pay2s.vn/hooks
   - Tạo Hook mới
   - URL: `https://yourdomain.com/api/webhook/pay2s`
   - Copy `Secret Key`

---

## 📡 API Endpoints

### 1. Create Payment QR Code

**Endpoint:** `POST /api/payment/pay2s/create`

**Purpose:** Tạo QR Code VietQR cho booking

**Request:**
```typescript
{
  bookingId: string // MongoDB ObjectId
}
```

**Response:**
```typescript
{
  success: true,
  qrCode: string,      // Base64 image
  qrUrl: string,       // Hosted image URL
  payUrl: string,      // Pay2S payment page
  transactionId: string,
  amount: number,
  bookingCode: string,
  expiredAt: string
}
```

**Logic:**
1. Fetch booking details từ DB
2. Tạo signature HMAC SHA256
3. Gọi Pay2S Collection Link API
4. Lưu `transactionId` vào booking
5. Return QR code để frontend hiển thị

---

### 2. IPN Callback (Instant Payment Notification)

**Endpoint:** `POST /api/payment/pay2s/ipn`

**Purpose:** Nhận thông báo tức thì khi thanh toán thành công

**Request (từ Pay2S):**
```typescript
{
  partnerCode: string,
  orderId: string,        // bookingId
  requestId: string,
  amount: number,
  orderInfo: string,      // bookingCode (VD: BK202510190001)
  orderType: string,
  transId: number,
  resultCode: number,     // 0 = success, 9000 = authorized
  message: string,
  payType: string,
  responseTime: string,
  extraData?: string,
  m2signature: string     // HMAC SHA256 signature
}
```

**Response (phải trả về trong 30s):**
```typescript
{
  success: true
}
```

**Logic:**
1. Extract data từ request body
2. **Verify signature** (HMAC SHA256)
   ```typescript
   const rawHash = `accessKey=${accessKey}&amount=${amount}&extraData=${extraData}&message=${message}&orderId=${orderId}&orderInfo=${orderInfo}&orderType=${orderType}&partnerCode=${partnerCode}&payType=${payType}&requestId=${requestId}&responseTime=${responseTime}&resultCode=${resultCode}&transId=${transId}`
   
   const expectedSignature = crypto
     .createHmac('sha256', secretKey)
     .update(rawHash)
     .digest('hex')
   
   if (m2signature !== expectedSignature) {
     return res.status(400).json({ error: 'Invalid signature' })
   }
   ```
3. Find booking by `orderId`
4. **Verify amount** khớp với booking
5. Check `resultCode`:
   - `0` hoặc `9000` → Success
   - Khác → Failed
6. Update booking:
   ```typescript
   booking.paymentStatus = 'paid'
   booking.status = 'confirmed'
   booking.paymentMethod = 'bank'
   booking.paymentTransactionId = transId
   await booking.save()
   ```
7. (Optional) Send confirmation email/SMS
8. Response `200 OK` + `{success: true}`

**⚠️ Important:**
- Phải response trong **30 giây**
- Phải return `200 OK` + `{"success": true}`
- Nếu không → Pay2S sẽ gửi lại (retry 5 lần, mỗi lần cách 60s)

---

### 3. Webhook Handler (Backup)

**Endpoint:** `POST /api/webhook/pay2s`

**Purpose:** Nhận biết MỌI giao dịch vào tài khoản (không chỉ qua Collection Link)

**Headers:**
```
Authorization: Bearer {webhook_secret_key}
Content-Type: application/json
```

**Request:**
```typescript
{
  transactions: [
    {
      id: string,
      gateway: string,              // VCB, ACB, TCB...
      transactionDate: string,      // YYYY-MM-DD HH:mm:ss
      transactionNumber: string,
      accountNumber: string,
      content: string,              // Nội dung CK
      transferType: 'IN' | 'OUT',
      transferAmount: number,
      checksum: string
    }
  ]
}
```

**Logic:**
1. Verify `Authorization Bearer` token
2. Parse `content` để extract bookingCode
   ```typescript
   const bookingCode = extractBookingCode(content)
   // VD: "BK202510190001 GD 750915" → "BK202510190001"
   ```
3. Find booking by `bookingCode`
4. Verify `transferAmount` khớp với booking
5. Update booking status
6. Response `200 OK` + `{success: true}`

---

### 4. Check Payment Status (Polling)

**Endpoint:** `GET /api/bookings/:id`

**Purpose:** Frontend poll mỗi 3 giây để check status

**Response:**
```typescript
{
  success: true,
  data: {
    _id: string,
    bookingCode: string,
    status: 'pending' | 'confirmed' | 'checked-in' | 'checked-out' | 'cancelled',
    paymentStatus: 'unpaid' | 'paid' | 'refunded',
    paymentTransactionId?: string,
    ...
  }
}
```

---

## 🔄 Flow thanh toán chi tiết

### Step-by-step với code

#### **Step 1: User submit booking form**

```typescript
// components/booking-form-v2.tsx
const handleSubmit = async () => {
  const bookingData = {
    roomId: selectedRoomId,
    customerName,
    phoneNumber,
    email,
    checkInTime: startTime,
    checkOutTime: endTime,
    pricing: {
      hours: totalHours,
      hourlyRate: room.pricePerHour,
      subtotal: calculateSubtotal(),
      total: calculateTotal(),
    }
  }
  
  const response = await fetch('/api/bookings', {
    method: 'POST',
    body: JSON.stringify(bookingData)
  })
  
  const { data } = await response.json()
  const bookingId = data._id
  
  // Redirect to payment page
  router.push(`/payment?bookingId=${bookingId}`)
}
```

**Backend tạo booking:**

```typescript
// app/api/bookings/route.ts
export async function POST(request: Request) {
  const body = await request.json()
  
  // Generate booking code
  const bookingCode = generateBookingCode() // "BK202510190001"
  
  const booking = await Booking.create({
    ...body,
    bookingCode,
    status: 'pending',
    paymentStatus: 'unpaid',
  })
  
  return NextResponse.json({
    success: true,
    data: booking
  })
}
```

---

#### **Step 2: Payment page load & tạo QR**

```typescript
// app/payment/page.tsx
'use client'

export default function PaymentPage() {
  const searchParams = useSearchParams()
  const bookingId = searchParams.get('bookingId')
  
  const [booking, setBooking] = useState(null)
  const [qrCode, setQrCode] = useState(null)
  const [paymentStatus, setPaymentStatus] = useState('pending')
  
  useEffect(() => {
    loadPaymentData()
    
    // Poll status every 3 seconds
    const interval = setInterval(() => {
      checkPaymentStatus()
    }, 3000)
    
    return () => clearInterval(interval)
  }, [bookingId])
  
  const loadPaymentData = async () => {
    // 1. Fetch booking
    const bookingRes = await fetch(`/api/bookings/${bookingId}`)
    const bookingData = await bookingRes.json()
    setBooking(bookingData.data)
    
    // 2. Create QR Code
    const qrRes = await fetch('/api/payment/pay2s/create', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ bookingId })
    })
    const qrData = await qrRes.json()
    
    if (qrData.success) {
      setQrCode(qrData.qrUrl)
    }
  }
  
  const checkPaymentStatus = async () => {
    const res = await fetch(`/api/bookings/${bookingId}`)
    const data = await res.json()
    
    if (data.data.paymentStatus === 'paid') {
      setPaymentStatus('success')
      // Show success modal, redirect, etc.
    }
  }
  
  if (paymentStatus === 'success') {
    return <PaymentSuccess booking={booking} />
  }
  
  return (
    <div className="payment-page">
      <Card>
        <CardHeader>
          <CardTitle>Thanh toán đặt phòng</CardTitle>
        </CardHeader>
        <CardContent>
          {/* Booking Info */}
          <div className="booking-summary">
            <p>Mã đặt phòng: <strong>{booking?.bookingCode}</strong></p>
            <p>Phòng: {booking?.roomId?.name}</p>
            <p>Tổng tiền: <strong>{booking?.pricing.total.toLocaleString()}đ</strong></p>
          </div>
          
          {/* QR Code */}
          {qrCode && (
            <div className="qr-section">
              <h3>Quét mã QR để thanh toán</h3>
              <Image src={qrCode} alt="QR Code" width={300} height={300} />
              
              <div className="instructions">
                <p>1. Mở app ngân hàng</p>
                <p>2. Quét mã QR</p>
                <p>3. Kiểm tra số tiền và nội dung</p>
                <p>4. Xác nhận thanh toán</p>
              </div>
              
              <div className="loading">
                <Loader2 className="animate-spin" />
                <span>Đang chờ thanh toán...</span>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
```

---

#### **Step 3: Backend tạo QR Code**

```typescript
// app/api/payment/pay2s/create/route.ts
import { NextResponse } from 'next/server'
import crypto from 'crypto'
import { Booking } from '@/lib/models'

export async function POST(request: Request) {
  try {
    const { bookingId } = await request.json()
    
    // 1. Fetch booking
    const booking = await Booking.findById(bookingId).populate('roomId')
    if (!booking) {
      return NextResponse.json({ error: 'Booking not found' }, { status: 404 })
    }
    
    // 2. Prepare Pay2S request
    const partnerCode = process.env.PAY2S_PARTNER_CODE!
    const accessKey = process.env.PAY2S_ACCESS_KEY!
    const secretKey = process.env.PAY2S_SECRET_KEY!
    const requestId = Date.now().toString()
    const orderId = booking._id.toString()
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
    
    // 3. Generate signature
    const rawHash = `accessKey=${accessKey}&amount=${amount}&bankAccounts=Array&ipnUrl=${ipnUrl}&orderId=${orderId}&orderInfo=${orderInfo}&partnerCode=${partnerCode}&redirectUrl=${redirectUrl}&requestId=${requestId}&requestType=${requestType}`
    
    const signature = crypto
      .createHmac('sha256', secretKey)
      .update(rawHash)
      .digest('hex')
    
    // 4. Call Pay2S API
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
    
    const response = await fetch(`${process.env.PAY2S_API_URL}/create`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload)
    })
    
    const data = await response.json()
    
    if (!response.ok) {
      throw new Error(data.message || 'Pay2S API error')
    }
    
    // 5. Save transaction ID
    booking.paymentTransactionId = data.transId
    await booking.save()
    
    // 6. Return QR code
    return NextResponse.json({
      success: true,
      qrCode: data.qrCode,
      qrUrl: data.qrUrl,
      payUrl: data.payUrl,
      transactionId: data.transId,
      amount: booking.pricing.total,
      bookingCode: booking.bookingCode,
      expiredAt: data.expiredAt
    })
    
  } catch (error: any) {
    console.error('Pay2S Create Error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to create payment' },
      { status: 500 }
    )
  }
}
```

---

#### **Step 4: User chuyển khoản**

User quét QR bằng app ngân hàng → Chuyển tiền với nội dung `BK202510190001`

---

#### **Step 5: IPN Callback**

```typescript
// app/api/payment/pay2s/ipn/route.ts
import { NextRequest, NextResponse } from 'next/server'
import crypto from 'crypto'
import { Booking } from '@/lib/models'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // 1. Extract data
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
    
    // 2. Verify signature
    const secretKey = process.env.PAY2S_SECRET_KEY!
    const rawHash = `accessKey=${accessKey}&amount=${amount}&extraData=${extraData}&message=${message}&orderId=${orderId}&orderInfo=${orderInfo}&orderType=${orderType}&partnerCode=${partnerCode}&payType=${payType}&requestId=${requestId}&responseTime=${responseTime}&resultCode=${resultCode}&transId=${transId}`
    
    const expectedSignature = crypto
      .createHmac('sha256', secretKey)
      .update(rawHash)
      .digest('hex')
    
    if (m2signature !== expectedSignature) {
      console.error('❌ Invalid signature')
      return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
    }
    
    // 3. Find booking
    const booking = await Booking.findById(orderId)
    if (!booking) {
      console.error('❌ Booking not found:', orderId)
      return NextResponse.json({ error: 'Booking not found' }, { status: 404 })
    }
    
    // 4. Verify amount
    if (amount !== booking.pricing.total) {
      console.error('❌ Amount mismatch:', { expected: booking.pricing.total, received: amount })
      return NextResponse.json({ error: 'Amount mismatch' }, { status: 400 })
    }
    
    // 5. Check result code
    if (resultCode === 0 || resultCode === 9000) {
      // ✅ Payment success
      booking.paymentStatus = 'paid'
      booking.status = 'confirmed'
      booking.paymentMethod = 'bank'
      booking.paymentTransactionId = transId.toString()
      await booking.save()
      
      console.log(`✅ Payment confirmed for booking ${booking.bookingCode}`)
      
      // TODO: Send confirmation email/SMS
      // await sendBookingConfirmation(booking)
    } else {
      // ❌ Payment failed
      console.error('❌ Payment failed:', { resultCode, message })
    }
    
    // 6. Response to Pay2S (MUST be 200 OK + {success: true})
    return NextResponse.json({ success: true })
    
  } catch (error: any) {
    console.error('❌ Pay2S IPN Error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
```

---

#### **Step 6: Webhook Handler (Backup)**

```typescript
// app/api/webhook/pay2s/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { Booking } from '@/lib/models'

export async function POST(request: NextRequest) {
  try {
    // 1. Verify Bearer token
    const authHeader = request.headers.get('authorization')
    if (!authHeader) {
      return NextResponse.json({ error: 'Missing authorization header' }, { status: 401 })
    }
    
    const token = authHeader.replace('Bearer ', '')
    const expectedToken = process.env.PAY2S_WEBHOOK_SECRET!
    
    if (token !== expectedToken) {
      console.error('❌ Invalid webhook token')
      return NextResponse.json({ error: 'Invalid token' }, { status: 403 })
    }
    
    // 2. Parse transactions
    const body = await request.json()
    const { transactions } = body
    
    if (!transactions || !Array.isArray(transactions)) {
      return NextResponse.json({ error: 'Invalid payload' }, { status: 400 })
    }
    
    // 3. Process each transaction
    for (const tx of transactions) {
      // Only process IN (incoming) transactions
      if (tx.transferType !== 'IN') continue
      
      // Extract booking code from content
      const bookingCode = extractBookingCode(tx.content)
      if (!bookingCode) continue
      
      // Find booking
      const booking = await Booking.findOne({ bookingCode })
      if (!booking) {
        console.warn(`⚠️ Booking not found for code: ${bookingCode}`)
        continue
      }
      
      // Verify amount
      if (tx.transferAmount !== booking.pricing.total) {
        console.error('❌ Amount mismatch:', {
          expected: booking.pricing.total,
          received: tx.transferAmount
        })
        continue
      }
      
      // Update booking
      if (booking.paymentStatus !== 'paid') {
        booking.paymentStatus = 'paid'
        booking.status = 'confirmed'
        booking.paymentMethod = 'bank'
        booking.paymentTransactionId = tx.transactionNumber
        await booking.save()
        
        console.log(`✅ Webhook: Payment confirmed for ${bookingCode}`)
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

function extractBookingCode(content: string): string | null {
  // Extract booking code from transaction content
  // VD: "BK202510190001 GD 750915-101925 14:23:07" → "BK202510190001"
  const match = content.match(/BK\d{12}/)
  return match ? match[0] : null
}
```

---

## 🧪 Testing

### Sandbox Environment

**Sử dụng môi trường test:**

```bash
# .env.local
PAY2S_API_URL=https://sandbox-payment.pay2s.vn/v1/gateway/api
```

**Test tools:**
- Dashboard: https://sandbox.pay2s.vn
- Tạo giao dịch ảo: https://sandbox.pay2s.vn/demo/transfer_demo.html
- Test IPN: https://sandbox.pay2s.vn/demo/ipn_demo.html

### Test Cases

#### ✅ Test 1: Tạo QR Code

```bash
curl -X POST http://localhost:3000/api/payment/pay2s/create \
  -H "Content-Type: application/json" \
  -d '{"bookingId": "670a1234567890abcdef1234"}'
```

**Expected:**
- Status: 200
- Response có `qrUrl`, `payUrl`, `transactionId`

---

#### ✅ Test 2: IPN Callback

```bash
curl -X POST http://localhost:3000/api/payment/pay2s/ipn \
  -H "Content-Type: application/json" \
  -d '{
    "partnerCode": "PAY2S72MLKFJFURCGPEM",
    "orderId": "670a1234567890abcdef1234",
    "amount": 200000,
    "orderInfo": "BK202510190001",
    "resultCode": 0,
    "transId": 2588659987,
    "m2signature": "..."
  }'
```

**Expected:**
- Status: 200
- Response: `{success: true}`
- Booking status updated: `paymentStatus = 'paid'`, `status = 'confirmed'`

---

#### ✅ Test 3: Webhook

```bash
curl -X POST http://localhost:3000/api/webhook/pay2s \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer your_webhook_secret" \
  -d '{
    "transactions": [{
      "id": "2288",
      "gateway": "VCB",
      "content": "BK202510190001 GD 750915",
      "transferType": "IN",
      "transferAmount": 200000
    }]
  }'
```

---

### Ngrok cho Local Testing

Pay2S cần gọi IPN/Webhook đến server của bạn → Dùng ngrok:

```bash
# Install ngrok
npm install -g ngrok

# Start ngrok
ngrok http 3000

# Update .env.local
PAY2S_IPN_URL=https://abc123.ngrok.io/api/payment/pay2s/ipn
```

---

## 🐛 Troubleshooting

### Lỗi thường gặp

#### ❌ "Invalid signature"

**Nguyên nhân:** 
- Sai `secretKey`
- Sai thứ tự fields trong `rawHash`
- Thiếu fields trong `rawHash`

**Cách fix:**
```typescript
// Đảm bảo sort fields theo alphabet
const rawHash = `accessKey=${accessKey}&amount=${amount}&bankAccounts=Array&ipnUrl=${ipnUrl}&orderId=${orderId}&orderInfo=${orderInfo}&partnerCode=${partnerCode}&redirectUrl=${redirectUrl}&requestId=${requestId}&requestType=${requestType}`

// Check console log
console.log('Raw Hash:', rawHash)
console.log('Signature:', signature)
```

---

#### ❌ "Amount mismatch"

**Nguyên nhân:**
- Frontend tính sai total
- DB lưu sai amount
- Pay2S nhận sai số tiền

**Cách fix:**
```typescript
// Log để debug
console.log('Expected:', booking.pricing.total)
console.log('Received:', amount)

// Ensure integer (no decimals)
const amount = Math.round(booking.pricing.total)
```

---

#### ❌ IPN không được gọi

**Nguyên nhân:**
- URL sai (localhost không accessible từ internet)
- Firewall block
- Server timeout > 30s

**Cách fix:**
1. Dùng **ngrok** cho local testing
2. Check logs tại https://my.pay2s.vn/history_webhook
3. Đảm bảo response trong 30s
4. Return đúng format: `200 OK` + `{success: true}`

---

#### ❌ "Booking not found"

**Nguyên nhân:**
- `orderId` không match `_id` trong DB
- Chuyển sai collection
- MongoDB connection issue

**Cách fix:**
```typescript
// Log để debug
console.log('Order ID from Pay2S:', orderId)

const booking = await Booking.findById(orderId)
console.log('Booking found:', booking)
```

---

## 📋 Checklist triển khai

### Pre-deployment

- [ ] **Environment Variables**
  - [ ] Tất cả PAY2S_* variables đã set
  - [ ] URLs đã đổi từ localhost sang production domain
  - [ ] Secret keys đã bảo mật (không commit)

- [ ] **Pay2S Dashboard**
  - [ ] Đã mua gói
  - [ ] Đã liên kết tài khoản ngân hàng
  - [ ] Đã lấy API keys
  - [ ] Đã setup Webhook URL

- [ ] **Testing**
  - [ ] Test create QR trong sandbox
  - [ ] Test IPN callback với ngrok
  - [ ] Test webhook với mock data
  - [ ] Test end-to-end flow

### Post-deployment

- [ ] **Monitoring**
  - [ ] Setup logging cho IPN/Webhook
  - [ ] Monitor webhook delivery tại Pay2S dashboard
  - [ ] Alert khi có failed transactions

- [ ] **Documentation**
  - [ ] Document cho team
  - [ ] Update API docs
  - [ ] Write runbook cho ops

---

## 📞 Support

### Pay2S Support
- Website: https://pay2s.vn
- Docs: https://docs.pay2s.vn
- Dashboard: https://my.pay2s.vn
- Support: contact@pay2s.vn

### Project Support
- GitHub Issues
- Internal Slack channel

---

## 📝 Changelog

### v1.0.0 (2025-10-19)
- ✅ Initial integration
- ✅ Collection Link API
- ✅ IPN Callback
- ✅ Webhook Handler
- ✅ Payment UI

---

**🎯 Ready to implement!** Đọc kỹ tài liệu này trước khi code.
