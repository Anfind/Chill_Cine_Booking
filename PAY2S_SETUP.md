# 🚀 Hướng dẫn Setup Pay2S - QUICK START

## ✅ Checklist Setup (15 phút)

### Bước 1: Lấy API Credentials từ Pay2S Dashboard

1. Đăng nhập: https://my.pay2s.vn
2. Vào **Tích hợp Web/App**: https://my.pay2s.vn/payment-intergration-center
3. Copy 3 thông tin sau:
   ```
   Partner Code: PAY2S72MLKFJFURCGPEM
   Access Key: 66e862c89d4d4d1f34063dc1967fbd64...
   Secret Key: your_secret_key_here
   ```

### Bước 2: Setup Webhook (Optional - cho đối soát)

1. Vào **Hooks**: https://my.pay2s.vn/hooks
2. Click "Tạo Hook mới"
3. Điền:
   - **URL**: `https://yourdomain.com/api/webhook/pay2s` 
   - **Tên**: Booking App Webhook
4. Copy **Secret Key** của hook

### Bước 3: Cập nhật `.env.local`

Mở file `.env.local` và điền thông tin:

```bash
# Pay2S Configuration
PAY2S_PARTNER_CODE=PAY2S72MLKFJFURCGPEM
PAY2S_ACCESS_KEY=66e862c89d4d4d1f34063dc1967fbd64dece4da3cba90af65167fbb8503b2eb3
PAY2S_SECRET_KEY=your_secret_key_here_from_step_1
PAY2S_API_URL=https://payment.pay2s.vn/v1/gateway/api
PAY2S_WEBHOOK_SECRET=your_webhook_secret_from_step_2

# Bank Info (lấy từ TK đã liên kết)
PAY2S_BANK_CODE=VCB
PAY2S_ACCOUNT_NUMBER=1234567890
PAY2S_ACCOUNT_NAME=NGUYEN VAN A

# URLs (đổi khi deploy production)
PAY2S_REDIRECT_URL=http://localhost:3000/payment/success
PAY2S_IPN_URL=http://localhost:3000/api/payment/pay2s/ipn
```

### Bước 4: Restart Dev Server

```bash
# Stop server (Ctrl+C)
# Start lại
npm run dev
```

---

## 🧪 Testing Local với Ngrok

Pay2S cần gọi IPN đến server của bạn → Dùng **ngrok** để expose localhost:

### Install Ngrok

```bash
# Windows (choco)
choco install ngrok

# Hoặc download: https://ngrok.com/download
```

### Chạy Ngrok

```bash
# Terminal 1: Dev server
npm run dev

# Terminal 2: Ngrok
ngrok http 3000
```

**Output ngrok:**
```
Forwarding  https://abc123.ngrok.io -> http://localhost:3000
```

### Update .env.local với Ngrok URL

```bash
PAY2S_IPN_URL=https://abc123.ngrok.io/api/payment/pay2s/ipn
```

**⚠️ Lưu ý:** 
- Ngrok URL thay đổi mỗi lần restart (free plan)
- Phải restart dev server sau khi đổi URL
- Có thể skip bước này nếu test với Sandbox

---

## 🧪 Test Flow

### Test 1: Tạo Booking

```bash
# Vào app
http://localhost:3000

# Đặt phòng bình thường qua UI
1. Chọn chi nhánh
2. Chọn phòng
3. Click timeline slot
4. Điền form → Submit
```

### Test 2: Check Payment Page

```bash
# Sau khi submit, tự động redirect đến:
http://localhost:3000/payment?bookingId=xxxxx

# Kiểm tra:
✅ Hiển thị QR Code
✅ Hiển thị thông tin booking
✅ Có loading "Đang chờ thanh toán..."
```

### Test 3: Simulate Payment (Sandbox)

**Option A: Qua Pay2S Dashboard**
1. Vào https://sandbox.pay2s.vn/demo/transfer_demo.html
2. Nhập số tiền và nội dung CK (bookingCode)
3. Submit

**Option B: Qua API trực tiếp**

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
    "accessKey": "your_access_key",
    "extraData": "",
    "message": "Giao dịch thành công",
    "orderType": "pay2s",
    "payType": "qr",
    "requestId": "1729311234567",
    "responseTime": "1729311234567",
    "m2signature": "generated_signature"
  }'
```

*(Cần tạo signature đúng - xem code trong `ipn/route.ts`)*

### Test 4: Check Result

**Frontend:**
- Payment page tự động chuyển sang "Thanh toán thành công"
- Redirect về timeline hoặc booking detail

**Backend:**
```bash
# Check logs
Terminal sẽ hiển thị:
✅ Payment confirmed for booking BK202510190001
```

**Database:**
```bash
# Mở MongoDB Compass
mongodb://localhost:27017/chill-cine-hotel

# Collection: bookings
# Find booking vừa test
# Check fields:
- paymentStatus: "paid"
- status: "confirmed"
- paymentMethod: "bank"
- paymentTransactionId: "2588659987"
```

---

## 📊 Monitor Webhook Delivery

**Pay2S Dashboard:**
1. Vào https://my.pay2s.vn/history_webhook
2. Xem logs của từng webhook call:
   - ✅ 200 OK: Thành công
   - ❌ 4xx/5xx: Lỗi
   - 🔄 Retry: Đang thử lại

---

## 🚨 Troubleshooting

### ❌ Error: "Invalid signature"

**Nguyên nhân:** Sai `SECRET_KEY` hoặc sai thứ tự fields trong rawHash

**Fix:**
```typescript
// Check console log
console.log('Raw Hash:', rawHash)
console.log('Signature:', signature)

// Đảm bảo SECRET_KEY đúng
console.log('Secret Key:', process.env.PAY2S_SECRET_KEY)
```

---

### ❌ Error: "Booking not found"

**Nguyên nhân:** `orderId` không match với `_id` trong MongoDB

**Fix:**
```typescript
// Log để debug
console.log('Order ID from Pay2S:', orderId)

const booking = await Booking.findById(orderId)
console.log('Booking found:', booking)
```

---

### ❌ IPN không được gọi

**Nguyên nhân:**
- URL sai
- Localhost không accessible từ internet
- Firewall block

**Fix:**
1. Dùng **ngrok** (xem bước ở trên)
2. Check logs tại: https://my.pay2s.vn/history_webhook
3. Test IPN manually bằng curl

---

### ❌ Amount mismatch

**Nguyên nhân:** Frontend tính sai total hoặc DB lưu sai

**Fix:**
```typescript
// Log để debug
console.log('Expected:', booking.pricing.total)
console.log('Received:', amount)

// Đảm bảo là số nguyên (không có decimal)
const amount = Math.round(booking.pricing.total)
```

---

## 📝 Notes

### Environment URLs

**Development:**
```bash
APP_URL=http://localhost:3000
IPN_URL=https://abc123.ngrok.io/api/payment/pay2s/ipn
```

**Production:**
```bash
APP_URL=https://yourdomain.com
IPN_URL=https://yourdomain.com/api/payment/pay2s/ipn
```

### Sandbox vs Production

**Sandbox (Testing):**
```bash
PAY2S_API_URL=https://sandbox-payment.pay2s.vn/v1/gateway/api
```

**Production (Real Money):**
```bash
PAY2S_API_URL=https://payment.pay2s.vn/v1/gateway/api
```

---

## ✅ Ready to Code!

Bây giờ bạn đã setup xong Pay2S! 

**Next steps:**
1. ✅ Test create QR code
2. ✅ Test IPN callback
3. ✅ Test end-to-end flow
4. 📝 Update payment page UI
5. 🚀 Deploy to production

**Need help?**
- Pay2S Docs: https://docs.pay2s.vn
- Project docs: `PAYMENT_INTEGRATION.md`
