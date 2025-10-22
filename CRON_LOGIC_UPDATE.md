# 🔧 Cập nhật Logic Cleanup: createdAt vs paymentQRCreatedAt

## ⚠️ VẤN ĐỀ ĐÃ PHÁT HIỆN

### Logic cũ (KHÔNG AN TOÀN):
```typescript
const expiredBookings = await Booking.find({
  status: 'pending',
  paymentStatus: 'unpaid',
  paymentQRCreatedAt: { 
    $exists: true,
    $lt: cutoffTime
  }
})
```

### Lỗ hổng bảo mật:
```javascript
// Scenario: User tạo booking nhưng ĐÓNG TAB trước khi vào payment page

Booking {
  _id: "507f1f77bcf86cd799439011",
  status: "pending",
  paymentStatus: "unpaid",
  createdAt: "2025-10-22T12:00:00Z",
  paymentQRCreatedAt: null  // ← KHÔNG BAO GIỜ BỊ HỦY!
}

// Kết quả:
// - Booking tồn tại mãi mãi trên timeline (màu vàng)
// - Chặn người khác đặt cùng khung giờ vĩnh viễn
// - User có thể "chiếm slot" bằng cách tạo nhiều booking mà không thanh toán
```

## ✅ GIẢI PHÁP ĐÃ ÁP DỤNG

### Logic mới (AN TOÀN):
```typescript
const expiredBookings = await Booking.find({
  status: 'pending',
  paymentStatus: 'unpaid',
  createdAt: {  // ← Đổi từ paymentQRCreatedAt sang createdAt
    $lt: cutoffTime
  }
})
```

### Ưu điểm:
1. ✅ **Đảm bảo 100% booking sẽ bị hủy:**
   - `createdAt` luôn tồn tại (Mongoose timestamps tự động tạo)
   - Không phụ thuộc vào việc user có vào payment page hay không

2. ✅ **Tránh lỗ hổng bảo mật:**
   - User không thể "chiếm slot" vĩnh viễn
   - Mọi booking pending đều có deadline 10 phút kể từ khi tạo

3. ✅ **Logic rõ ràng và nhất quán:**
   - Countdown 10 phút bắt đầu từ lúc tạo booking
   - Cron job hủy booking sau 10 phút từ lúc tạo
   - Thời gian khớp nhau hoàn toàn

## 📊 SO SÁNH

| Tiêu chí | paymentQRCreatedAt (CŨ) | createdAt (MỚI) |
|----------|------------------------|-----------------|
| **Luôn tồn tại** | ❌ Có thể null | ✅ Luôn có |
| **Bảo mật** | ❌ Có lỗ hổng | ✅ An toàn |
| **Bao phủ** | ❌ Chỉ booking có QR | ✅ Mọi booking |
| **Công bằng** | ❌ User có thể cheat | ✅ Mọi user bình đẳng |
| **Đơn giản** | ❌ Phức tạp | ✅ Đơn giản |

## 🔄 NHỮNG GÌ ĐÃ THAY ĐỔI

### 1. File: `app/api/bookings/cleanup/route.ts`

**POST endpoint (execute):**
```diff
- paymentQRCreatedAt: { $exists: true, $lt: cutoffTime }
+ createdAt: { $lt: cutoffTime }
```

**GET endpoint (preview):**
```diff
- paymentQRCreatedAt: { $exists: true, $lt: cutoffTime }
+ createdAt: { $lt: cutoffTime }
```

**Elapsed time calculation:**
```diff
- const elapsed = (now - booking.paymentQRCreatedAt) / 1000
+ const elapsed = (now - booking.createdAt) / 1000
```

**Cancel reason message:**
```diff
- cancelReason: `Auto-cancelled: Payment timeout (${minutes} minutes)`
+ cancelReason: `Auto-cancelled: Payment timeout (${minutes} minutes since booking creation)`
```

**Response data:**
```diff
  cancelledBookings.push({
    bookingCode: booking.bookingCode,
    bookingId: String(booking._id),
    customerName: booking.customerInfo?.name,
    elapsedMinutes: Math.floor(elapsed / 60),
+   hadQRCode: !!booking.paymentQRCreatedAt  // ← Thêm field để debug
  })
```

### 2. File: `lib/cron/README.md`
- ✅ Cập nhật documentation logic
- ✅ Thêm giải thích tại sao dùng `createdAt`
- ✅ Cảnh báo về lỗ hổng của `paymentQRCreatedAt`

### 3. File: `CRON_IMPLEMENTATION.md`
- ✅ Cập nhật flow diagram
- ✅ Cập nhật response examples
- ✅ Cập nhật log examples
- ✅ Thêm field `hadQRCode` trong response

## 🧪 TESTING

### Test Case 1: Booking với QR code
```
1. User tạo booking → createdAt = T0
2. User vào payment page → paymentQRCreatedAt = T0 + 30s
3. Đợi 10 phút
4. Cron chạy → Check createdAt (T0) → Cancel ✅
```

### Test Case 2: Booking KHÔNG có QR code (Lỗ hổng cũ)
```
1. User tạo booking → createdAt = T0
2. User ĐÓNG TAB (không vào payment page) → paymentQRCreatedAt = null
3. Đợi 10 phút
4. Cron chạy → Check createdAt (T0) → Cancel ✅

// Logic cũ: KHÔNG cancel vì paymentQRCreatedAt = null ❌
// Logic mới: Cancel vì createdAt > 10 phút ✅
```

### Test Case 3: Multiple bookings attack
```
Attacker tạo 100 bookings liên tục nhưng không thanh toán:

Logic cũ:
- Nếu không vào payment page → 100 bookings tồn tại mãi ❌
- Chặn hết slot trong timeline

Logic mới:
- Sau 10 phút, cron tự động cancel hết 100 bookings ✅
- Slot được giải phóng
```

## 📝 DATABASE QUERY

### Tìm bookings sẽ bị cancel:
```javascript
db.bookings.find({
  status: 'pending',
  paymentStatus: 'unpaid',
  createdAt: { 
    $lt: new Date(Date.now() - 10 * 60 * 1000) 
  }
})
```

### Tìm bookings đã bị auto-cancel:
```javascript
db.bookings.find({
  status: 'cancelled',
  cancelReason: { 
    $regex: /Auto-cancelled: Payment timeout.*since booking creation/ 
  }
})
```

### Thống kê bookings không có QR code:
```javascript
db.bookings.aggregate([
  {
    $match: {
      status: 'cancelled',
      cancelReason: { $regex: /Auto-cancelled: Payment timeout/ }
    }
  },
  {
    $group: {
      _id: { 
        hasQR: { $ne: ['$paymentQRCreatedAt', null] } 
      },
      count: { $sum: 1 }
    }
  }
])

// Result example:
// { _id: { hasQR: false }, count: 15 }  ← 15 bookings không có QR bị cancel
// { _id: { hasQR: true },  count: 42 }  ← 42 bookings có QR bị cancel
```

## 🎯 KẾT LUẬN

### Trước khi sửa:
- ❌ Có lỗ hổng bảo mật
- ❌ User có thể chiếm slot vĩnh viễn
- ❌ Logic phức tạp và không nhất quán
- ❌ Chỉ cancel bookings có `paymentQRCreatedAt`

### Sau khi sửa:
- ✅ An toàn và bảo mật
- ✅ Mọi booking pending đều bị cancel đúng hạn
- ✅ Logic đơn giản và rõ ràng
- ✅ Cancel MỌI booking sau 10 phút từ lúc tạo
- ✅ Field `hadQRCode` giúp debug và monitoring

### Impact:
- 🔒 **Security:** Loại bỏ lỗ hổng cho phép user chiếm slot
- 🎯 **Accuracy:** 100% booking sẽ bị cancel đúng hạn
- 📊 **Monitoring:** Có thể track bookings có/không QR code
- 🧹 **Cleanup:** Database luôn sạch, không có booking "ma"

---

**Thay đổi này đảm bảo hệ thống hoạt động chính xác và an toàn hơn!**
