# 🔧 Fix IPN Handler - Test Guide

## ✅ Đã Fix

### Vấn đề:
- Booking được đánh dấu "paid" ngay lập tức (vài giây) sau khi tạo payment
- Nguyên nhân: IPN handler xử lý TẤT CẢ IPN callbacks, kể cả PENDING/TEST

### Giải pháp:
1. **Kiểm tra `resultCode` NGAY ĐẦU TIÊN**:
   - `resultCode = 0` hoặc `9000` → SUCCESS → Update booking
   - `resultCode` khác → PENDING/FAILED → Skip, không update

2. **Thêm logging chi tiết** để debug
3. **Thêm check duplicate** để tránh xử lý 2 lần

---

## 🧪 Cách Test

### Bước 1: Restart Dev Server
```bash
# Trong terminal đang chạy dev server
# Nhấn Ctrl+C để stop
# Sau đó:
pnpm dev
```

### Bước 2: Tạo Booking Mới
1. Vào http://localhost:3000
2. Chọn chi nhánh và phòng
3. Điền thông tin khách hàng
4. Nhấn "Đặt phòng"

### Bước 3: Kiểm Tra Payment Page
Khi redirect sang `/payment?bookingId=xxx`:

1. **QR code sẽ hiện**
2. **QUAN TRỌNG: XEM TERMINAL LOGS**

   Ngay sau khi QR hiện, sẽ có log:
   ```
   📨 Pay2S IPN Received: {
     orderId: '...',
     amount: 160000,
     resultCode: XXXX,    <-- XEM GIÁ TRỊ NÀY!
     message: '...',
     transId: null
   }
   ```

3. **Nếu `resultCode !== 0` và `!== 9000`**:
   ```
   ⏭️  Skipping IPN - resultCode XXXX is not success
   ```
   → ✅ ĐÚNG! Booking vẫn unpaid, QR vẫn hiển thị

4. **Booking KHÔNG được đánh dấu paid** → Thành công!

### Bước 4: Test Thanh Toán Thật
1. **Mở app ngân hàng** (VCB, ACB, MBBank...)
2. **Quét QR code**
3. **Chuyển khoản ĐÚNG SỐ TIỀN**
4. **Chờ 5-10 giây**

Kiểm tra terminal logs:
```
📨 Pay2S IPN Received: {
  orderId: '...',
  amount: 160000,
  resultCode: 0,       <-- SUCCESS!
  message: 'Success',
  transId: 'TRANS123'  <-- Có transaction ID
}
✅ Signature verified
✅ Payment confirmed for booking BKXXXXXXXXXXXX {
  bookingId: '...',
  transactionId: 'TRANS123',
  amount: 160000,
  resultCode: 0
}
```

5. **Trang sẽ tự động redirect** sang `/payment/success` → ✅ Thành công!

---

## 📊 Các ResultCode của Pay2S

| resultCode | Ý nghĩa | Hành động |
|------------|---------|-----------|
| 0 | Thành công | ✅ Update booking → paid |
| 9000 | Thành công | ✅ Update booking → paid |
| 1001 | Đang chờ xử lý | ⏭️  Skip, giữ unpaid |
| 1002 | Giao dịch bị từ chối | ⏭️  Skip |
| 1003 | Đã hủy | ⏭️  Skip |
| 9999 | Lỗi hệ thống | ⏭️  Skip |
| Khác | Pending/Unknown | ⏭️  Skip |

---

## 🐛 Troubleshooting

### Vấn đề: Vẫn bị marked as paid ngay lập tức

**Kiểm tra:**
1. Terminal logs có hiện `resultCode` không?
2. Giá trị `resultCode` là gì?
3. Có log `⏭️  Skipping IPN` không?

**Nếu KHÔNG có logs:**
- Dev server chưa restart
- Code cũ vẫn đang chạy
- Restart lại dev server!

**Nếu có log nhưng vẫn marked paid:**
- Có thể có 2 webhook đang chạy song song
- Kiểm tra file `app/api/webhook/pay2s/route.ts` (webhook thứ 2)
- Xem ngrok dashboard: http://127.0.0.1:4040

### Vấn đề: Chuyển tiền rồi nhưng không tự động redirect

**Kiểm tra:**
1. Terminal có log `✅ Payment confirmed` không?
2. Webhook URL trong Pay2S dashboard đúng chưa?
   - Phải là: `https://YOUR-NGROK-URL.ngrok-free.app/api/payment/pay2s/ipn`
3. Ngrok có đang chạy không?
4. Kiểm tra ngrok dashboard: http://127.0.0.1:4040

### Vấn đề: Invalid signature

**Kiểm tra:**
1. PAY2S_SECRET_KEY trong `.env.local` đúng chưa?
2. Copy lại từ Pay2S dashboard
3. Restart dev server sau khi thay đổi .env

---

## 📝 Debug Commands

### Xem MongoDB booking status:
```bash
# Connect to MongoDB
mongosh mongodb://localhost:27017/chill-cine-hotel

# Trong mongo shell:
db.bookings.find().sort({createdAt: -1}).limit(1).pretty()
```

### Xem ngrok logs:
```bash
# Mở browser:
http://127.0.0.1:4040
```

### Test tạo booking:
```bash
node scripts/create-test-booking.js
```

### Xóa test booking:
```bash
node scripts/delete-booking.js <bookingId>
```

---

## ✅ Expected Behavior

### Khi tạo payment (chưa chuyển tiền):
1. QR code hiển thị
2. IPN được gọi với resultCode !== 0/9000
3. Log: `⏭️  Skipping IPN`
4. Booking vẫn `paymentStatus: 'unpaid'`
5. Trang vẫn ở `/payment`, polling tiếp
6. Countdown timer chạy (10 phút)

### Khi chuyển tiền thành công:
1. Pay2S detect giao dịch
2. IPN được gọi với resultCode = 0 và transId
3. Log: `✅ Payment confirmed`
4. Booking update: `paymentStatus: 'paid', status: 'confirmed'`
5. Polling detect change
6. Auto redirect sang `/payment/success`
7. Confetti animation 🎉

---

## 🎯 Next Steps

Sau khi fix này work:
1. Test với nhiều booking khác nhau
2. Test với số tiền khác nhau
3. Test timeout scenario (đợi hết 10 phút)
4. Test cancel payment
5. Implement email confirmation
6. Implement SMS notification
