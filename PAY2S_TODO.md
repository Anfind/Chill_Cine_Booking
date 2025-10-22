# 🎯 Pay2S Integration - READY TO IMPLEMENT

## ✅ Đã hoàn thành (Backend)

### 1. Database Schema
- ✅ Updated `Booking` model với field `paymentTransactionId`

### 2. API Routes
- ✅ `POST /api/payment/pay2s/create` - Tạo QR Code
- ✅ `POST /api/payment/pay2s/ipn` - IPN Callback
- ✅ `POST /api/webhook/pay2s` - Webhook Handler

### 3. Utilities & Constants
- ✅ `lib/constants/pay2s.ts` - Constants & helpers

### 4. Documentation
- ✅ `PAYMENT_INTEGRATION.md` - Technical deep dive
- ✅ `PAY2S_SETUP.md` - Quick start guide
- ✅ `PAY2S_IMPLEMENTATION.md` - Implementation status

---

## 📋 TODO List - BẠN CẦN LÀM

### 🔴 URGENT (Bắt buộc để test)

#### 1. Fill Environment Variables
File: `.env.local`

```bash
# Vào https://my.pay2s.vn/payment-intergration-center
PAY2S_PARTNER_CODE=your_partner_code_here          # ← ĐIỀN VÀO ĐÂY
PAY2S_ACCESS_KEY=your_access_key_here              # ← ĐIỀN VÀO ĐÂY
PAY2S_SECRET_KEY=your_secret_key_here              # ← ĐIỀN VÀO ĐÂY

# Bank info (từ TK đã liên kết)
PAY2S_BANK_CODE=VCB                                # ← ĐỔI NẾU DÙNG BANK KHÁC
PAY2S_ACCOUNT_NUMBER=1234567890                    # ← ĐIỀN SỐ TK
PAY2S_ACCOUNT_NAME=NGUYEN VAN A                    # ← ĐIỀN TÊN CHỦ TK

# Webhook (optional)
PAY2S_WEBHOOK_SECRET=your_webhook_secret           # ← NẾU SETUP WEBHOOK
```

**Status:** ⏳ ĐANG CHỜ BẠN ĐIỀN

---

#### 2. Update Payment Page
File: `app/payment/page.tsx`

**Hiện tại:** Đang dùng mock data từ `lib/data.ts`

**Cần làm:**
```typescript
// BEFORE (Mock data)
const room = rooms.find(r => r.id === roomId)

// AFTER (Real data)
const loadPaymentData = async () => {
  // 1. Fetch booking
  const bookingRes = await fetch(`/api/bookings/${bookingId}`)
  const { data: booking } = await bookingRes.json()
  setBooking(booking)
  
  // 2. Create QR Code
  const qrRes = await fetch('/api/payment/pay2s/create', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ bookingId })
  })
  const qrData = await qrRes.json()
  setQrCode(qrData.qrUrl)
}
```

**Status:** ⏳ CHƯA LÀM

---

#### 3. Add Payment Status Polling
File: `app/payment/page.tsx`

```typescript
// Poll every 3 seconds
useEffect(() => {
  const interval = setInterval(async () => {
    const res = await fetch(`/api/bookings/${bookingId}`)
    const { data } = await res.json()
    
    if (data.paymentStatus === 'paid') {
      setPaymentStatus('success')
      clearInterval(interval)
    }
  }, 3000)
  
  return () => clearInterval(interval)
}, [bookingId])
```

**Status:** ⏳ CHƯA LÀM

---

### 🟡 RECOMMENDED (Nên làm)

#### 4. Create Success Page
File: `app/payment/success/page.tsx` (NEW FILE)

```typescript
export default function PaymentSuccessPage() {
  return (
    <div className="success-container">
      <CheckCircle2 className="h-16 w-16 text-green-600" />
      <h2>Thanh toán thành công!</h2>
      <p>Mã đặt phòng: {booking.bookingCode}</p>
      <Button onClick={() => router.push('/')}>Về trang chủ</Button>
    </div>
  )
}
```

**Status:** ⏳ CHƯA TẠO

---

#### 5. Setup Ngrok (for local testing)
```bash
# Install
choco install ngrok

# Run
ngrok http 3000

# Update .env.local
PAY2S_IPN_URL=https://abc123.ngrok.io/api/payment/pay2s/ipn
```

**Status:** ⏳ CHƯA SETUP

---

### 🟢 OPTIONAL (Có thể làm sau)

#### 6. Email Notifications
File: `lib/utils/email.ts` (NEW FILE)

```typescript
export async function sendBookingConfirmation(booking: IBooking) {
  // TODO: Implement email sending
  // Options: Resend, SendGrid, Nodemailer
}
```

**Status:** ⏳ CHƯA LÀM

---

#### 7. Error Monitoring
- [ ] Setup Sentry or similar
- [ ] Add error tracking for IPN failures
- [ ] Alert on webhook delivery failures

**Status:** ⏳ CHƯA SETUP

---

## 🧪 Testing Plan

### Phase 1: Local Testing (với ngrok)
1. ✅ Fill env variables
2. ⏳ Start ngrok
3. ⏳ Update IPN URL
4. ⏳ Restart dev server
5. ⏳ Create test booking
6. ⏳ Check QR generated
7. ⏳ Simulate payment (sandbox)
8. ⏳ Verify IPN received
9. ⏳ Check DB updated

### Phase 2: Sandbox Testing
10. ⏳ Test with Pay2S sandbox environment
11. ⏳ Verify webhook delivery logs
12. ⏳ Test error scenarios (wrong amount, invalid signature)

### Phase 3: Production Testing
13. ⏳ Deploy to staging
14. ⏳ Test with real bank transfer (small amount)
15. ⏳ Monitor logs
16. ⏳ Deploy to production

---

## 📊 Implementation Progress

```
Backend:  ████████████████████ 100% ✅
Frontend: ████░░░░░░░░░░░░░░░░  20% ⏳
Testing:  ░░░░░░░░░░░░░░░░░░░░   0% ⏳
Docs:     ████████████████████ 100% ✅

Overall:  ████████░░░░░░░░░░░░  40% 🟡
```

---

## 🚀 Quick Start Commands

```bash
# 1. Install dependencies (if needed)
npm install

# 2. Setup environment
# → Edit .env.local (fill Pay2S credentials)

# 3. Start dev server
npm run dev

# 4. (Optional) Start ngrok for IPN testing
ngrok http 3000

# 5. Test!
# → Visit http://localhost:3000
# → Create a booking
# → Check payment page
```

---

## 📚 Documentation Files

| File | Purpose | Status |
|------|---------|--------|
| `PAYMENT_INTEGRATION.md` | Full technical docs | ✅ Complete |
| `PAY2S_SETUP.md` | Quick setup guide | ✅ Complete |
| `PAY2S_IMPLEMENTATION.md` | Implementation status | ✅ Complete |
| `PAY2S_TODO.md` | This file - TODO list | ✅ Complete |

---

## 🎯 Next Steps

1. **Ngay bây giờ:**
   - [ ] Điền credentials vào `.env.local`
   - [ ] Restart server: `npm run dev`
   - [ ] Test API với Postman/curl

2. **Hôm nay:**
   - [ ] Update Payment Page để fetch real data
   - [ ] Add QR Code display
   - [ ] Add polling logic

3. **Tuần này:**
   - [ ] Setup ngrok
   - [ ] Test end-to-end với sandbox
   - [ ] Create success page

4. **Trước khi deploy:**
   - [ ] Production environment config
   - [ ] Email notifications
   - [ ] Error monitoring

---

## 💬 Need Help?

**Documentation:**
- Read: `PAYMENT_INTEGRATION.md` (chi tiết kỹ thuật)
- Read: `PAY2S_SETUP.md` (hướng dẫn setup)

**Pay2S Support:**
- Docs: https://docs.pay2s.vn
- Dashboard: https://my.pay2s.vn
- Email: contact@pay2s.vn

**Common Issues:**
- Invalid signature → Check `SECRET_KEY` & rawHash order
- IPN not received → Use ngrok or check firewall
- Amount mismatch → Log both values for debug

---

**Status:** 🟡 Backend Complete, Ready for Frontend

**Waiting for:** YOUR ACTION - Fill credentials & update payment page!

**Estimated time to complete:** 2-3 hours 🚀
