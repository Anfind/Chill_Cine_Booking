# 🧪 HƯỚNG DẪN TEST PAY2S INTEGRATION

## 📋 Checklist trước khi test

- [x] ✅ Ngrok đang chạy (`ngrok http 3000`)
- [x] ✅ Dev server đang chạy (`npm run dev`)
- [x] ✅ MongoDB đang chạy
- [x] ✅ `.env.local` đã điền đầy đủ credentials
- [ ] ⏳ Chạy test script

---

## 🚀 BƯỚC 1: Chạy Test Script

### Install dependencies (nếu chưa có)
```bash
npm install dotenv
```

### Chạy test
```bash
node scripts/test-pay2s.js
```

### Kết quả mong đợi

```
🧪 PAY2S INTEGRATION TEST SUITE
═════════════════════════════════════

🔧 Pay2S Configuration Loaded:
─────────────────────────────────────
Partner Code: PAY2S8FE2PW8DSTKYTWN
Access Key: 40fc988c0c175b5709...
Secret Key: 872e484b36d07f1d92...
Webhook Secret: cf88cba6072a22f979...
IPN URL: https://b0fd13d62299.ngrok-free.app/api/payment/pay2s/ipn
Bank: ACB - 22226061
─────────────────────────────────────

📝 Test 1: Checking Environment Variables
─────────────────────────────────────
✅ PAY2S_PARTNER_CODE: SET
✅ PAY2S_ACCESS_KEY: SET
✅ PAY2S_SECRET_KEY: SET
✅ PAY2S_WEBHOOK_SECRET: SET
✅ PAY2S_BANK_CODE: SET
✅ PAY2S_ACCOUNT_NUMBER: SET
✅ PAY2S_ACCOUNT_NAME: SET
✅ PAY2S_IPN_URL: SET
✅ PAY2S_REDIRECT_URL: SET

📝 Test 2: Testing Signature Generation
─────────────────────────────────────
✅ Signature generation works!

📝 Test 3: Testing Webhook Endpoint
─────────────────────────────────────
Status: 200
Response: { "success": true }
✅ Webhook test PASSED!

📝 Test 4: Testing IPN Endpoint
─────────────────────────────────────
Status: 404 (or 200)
Response: { "success": true } or { "error": "Booking not found" }
⚠️  IPN endpoint returned 404 - Booking not found (expected for test)

═════════════════════════════════════
📊 TEST SUMMARY
═════════════════════════════════════
✅ Environment Variables
✅ Signature Generation
✅ Webhook Endpoint
✅ IPN Endpoint
─────────────────────────────────────
Total: 4/4 tests passed
═════════════════════════════════════

🎉 ALL TESTS PASSED! Ready to implement payment flow!
```

---

## 🧪 BƯỚC 2: Test End-to-End với Postman

### Test 2.1: Create Payment QR Code

**Endpoint:** `POST http://localhost:3000/api/payment/pay2s/create`

**Headers:**
```
Content-Type: application/json
```

**Body:**
```json
{
  "bookingId": "670a1234567890abcdef1234"
}
```

**Expected Response (Error - vì booking không tồn tại):**
```json
{
  "error": "Booking not found"
}
```

**Expected Response (Success - nếu có booking thật):**
```json
{
  "success": true,
  "qrCode": "data:image/png;base64,iVBORw0KGgo...",
  "qrUrl": "https://img.vietqr.io/...",
  "payUrl": "https://payment.pay2s.vn/...",
  "transactionId": "123456789",
  "amount": 200000,
  "bookingCode": "BK202510190001",
  "expiredAt": "2025-10-19T15:45:00Z"
}
```

---

### Test 2.2: Test IPN Callback

**Endpoint:** `POST http://localhost:3000/api/payment/pay2s/ipn`

**Headers:**
```
Content-Type: application/json
```

**Body:** (sử dụng signature từ test script)
```json
{
  "accessKey": "40fc988c0c175b57096f15bb03b4d098400f60b1f66d934446ec9063d45f6cfa",
  "amount": 200000,
  "extraData": "",
  "message": "Giao dịch thành công",
  "orderId": "670a1234567890abcdef1234",
  "orderInfo": "BK202510190001",
  "orderType": "pay2s",
  "partnerCode": "PAY2S8FE2PW8DSTKYTWN",
  "payType": "qr",
  "requestId": "1729311234567",
  "responseTime": "1729311234567",
  "resultCode": 0,
  "transId": 258865998,
  "m2signature": "<generated_from_test_script>"
}
```

**Expected Response:**
```json
{
  "success": true
}
```

---

### Test 2.3: Test Webhook

**Endpoint:** `POST http://localhost:3000/api/webhook/pay2s`

**Headers:**
```
Content-Type: application/json
Authorization: Bearer cf88cba6072a22f9798185eda8d9025b01424672d635570727
```

**Body:**
```json
{
  "transactions": [
    {
      "id": "123456",
      "gateway": "ACB",
      "transactionDate": "2025-10-19 14:30:00",
      "transactionNumber": "FT12345678",
      "accountNumber": "22226061",
      "content": "BK202510190001 GD 750915",
      "transferType": "IN",
      "transferAmount": 200000,
      "checksum": "abc123test"
    }
  ]
}
```

**Expected Response:**
```json
{
  "success": true
}
```

**Check Terminal Logs:**
```
✅ Webhook: Token verified
📨 Webhook: Received 1 transaction(s)
🔍 Looking for booking: BK202510190001
⚠️  Booking not found for code: BK202510190001
```

---

## 🧪 BƯỚC 3: Test với Booking thật

### 3.1: Tạo booking thật qua UI

1. Vào http://localhost:3000
2. Chọn chi nhánh
3. Chọn phòng
4. Click timeline slot
5. Điền form và submit

**Kết quả:** Booking được tạo với status `pending`, `paymentStatus: unpaid`

---

### 3.2: Test Create QR với booking thật

**Copy bookingId từ MongoDB hoặc response**, sau đó:

```bash
curl -X POST http://localhost:3000/api/payment/pay2s/create \
  -H "Content-Type: application/json" \
  -d '{"bookingId": "REAL_BOOKING_ID_HERE"}'
```

**Expected Response:**
```json
{
  "success": true,
  "qrUrl": "https://img.vietqr.io/image/ACB-22226061-compact.jpg?amount=200000&addInfo=BK202510190001",
  "bookingCode": "BK202510190001",
  "amount": 200000
}
```

**Check DB:** Booking có field `paymentTransactionId` đã được fill

---

### 3.3: Mở QR Code trong browser

Copy `qrUrl` và mở trong browser → Hiển thị QR Code VietQR

---

### 3.4: Giả lập thanh toán

**Option A: Dùng Pay2S Sandbox**
1. Vào https://sandbox.pay2s.vn/demo/transfer_demo.html
2. Nhập:
   - Số tiền: `200000`
   - Nội dung: `BK202510190001` (bookingCode thật)
3. Submit

**Option B: Gọi IPN trực tiếp**

```bash
# Dùng signature từ test script
curl -X POST https://b0fd13d62299.ngrok-free.app/api/payment/pay2s/ipn \
  -H "Content-Type: application/json" \
  -d '{
    "orderId": "REAL_BOOKING_ID",
    "amount": 200000,
    "orderInfo": "BK202510190001",
    "resultCode": 0,
    "transId": 123456789,
    "m2signature": "..."
  }'
```

**Check DB:** 
- `paymentStatus` → `paid`
- `status` → `confirmed`
- `paymentMethod` → `bank`
- `paymentTransactionId` → có giá trị

**Check Terminal:**
```
✅ Payment confirmed for booking BK202510190001
```

---

## 📊 BƯỚC 4: Kiểm tra logs trên Pay2S Dashboard

1. Vào https://my.pay2s.vn/history_webhook
2. Xem logs của webhook calls:
   - ✅ 200 OK: Thành công
   - ❌ 4xx/5xx: Lỗi
   - 🔄 Retry: Đang thử lại

---

## ✅ CHECKLIST SAU KHI TEST

- [ ] Test script chạy thành công (4/4 tests passed)
- [ ] Create QR API hoạt động
- [ ] IPN callback hoạt động
- [ ] Webhook hoạt động
- [ ] Signature verification đúng
- [ ] Booking status được update
- [ ] Logs rõ ràng, không có error

---

## 🎯 NẾU TẤT CẢ TEST PASS → IMPLEMENT FRONTEND

Khi tất cả backend tests pass, sẵn sàng implement:

1. ✅ Update Payment Page (`app/payment/page.tsx`)
2. ✅ Add QR Code display
3. ✅ Add payment status polling
4. ✅ Create success page
5. ✅ Add loading states
6. ✅ Error handling

---

## 🐛 Troubleshooting

### ❌ Test script lỗi "Cannot find module 'dotenv'"

```bash
npm install dotenv
```

---

### ❌ Webhook test failed với 403 Forbidden

**Nguyên nhân:** Sai `PAY2S_WEBHOOK_SECRET`

**Fix:** Copy lại token từ Pay2S Dashboard (click icon 👁️ ở cột Token)

---

### ❌ IPN test failed với "Invalid signature"

**Nguyên nhân:** 
- Sai `PAY2S_SECRET_KEY`
- Sai thứ tự fields trong rawHash

**Fix:** Check console log để xem rawHash và signature

---

### ❌ ngrok URL không kết nối được

**Nguyên nhân:** Ngrok đã tắt hoặc URL thay đổi

**Fix:**
```bash
# Chạy lại ngrok
ngrok http 3000

# Copy URL mới và update:
# 1. Pay2S Dashboard → Webhook Endpoint
# 2. .env.local → PAY2S_IPN_URL
# 3. Restart dev server
```

---

## 🚀 Ready to implement!

Sau khi tất cả tests pass, chạy lệnh:

```bash
echo "🎉 Backend Ready! Starting Frontend Implementation..."
```

Và bắt đầu update Payment Page! 🎯
