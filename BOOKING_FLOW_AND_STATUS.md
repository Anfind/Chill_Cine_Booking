# 📋 Booking Flow & Status Documentation

**Ngày:** 17 Oct 2025  
**Hệ thống:** Chill Cine Hotel - Cinema Room Booking System

---

## 🔄 Booking Flow (Luồng Đặt Phòng)

```
┌─────────────────────────────────────────────────────────────────────┐
│                     BOOKING LIFECYCLE FLOW                          │
└─────────────────────────────────────────────────────────────────────┘

1. KHÁCH HÀNG CHỌN PHÒNG
   ↓
   - Chọn tỉnh thành → Chi nhánh → Xem danh sách phòng
   - Xem chi tiết phòng (giá, tiện nghi, ảnh, sức chứa)
   
2. CHỌN GIỜ ĐẶT
   ↓
   - Chọn ngày
   - Chọn giờ bắt đầu (startTime)
   - Chọn giờ kết thúc (endTime)
   - Hệ thống tự động tính duration (giờ)
   
   ⚠️ VALIDATION:
   - ❌ Không được chọn giờ quá khứ (< now + 5 phút)
   - ❌ endTime phải sau startTime
   - ❌ Không được trùng với booking khác (status: pending/confirmed/checked-in)

3. CHỌN COMBO/MENU (Optional)
   ↓
   - Chọn combo package (giá cố định cho duration)
   - Hoặc tính theo giá phòng/giờ
   - Thêm menu items (đồ ăn/uống)

4. ĐIỀN THÔNG TIN KHÁCH HÀNG
   ↓
   - Tên (required)
   - Số điện thoại (required)
   - Email (optional)
   - Ghi chú (optional)

5. TẠO BOOKING
   ↓
   - Generate bookingCode: BK{timestamp}{random}
   - Tính pricing: roomTotal + menuTotal - discount + tax
   - Status: 'pending'
   - PaymentStatus: 'unpaid'
   - Lưu vào database

6. THANH TOÁN (Payment Flow)
   ↓
   [Pending] → Chọn phương thức thanh toán
      ├─ Card (thẻ)
      ├─ E-wallet (ví điện tử)
      ├─ Bank transfer (chuyển khoản)
      └─ Cash (tiền mặt - thanh toán tại quầy)
   
   → PaymentStatus: 'paid'
   → Status: 'confirmed' ✅

7. CHECK-IN (Tại quầy/Tự động)
   ↓
   [Confirmed] → Khách đến quầy
   → Admin/Staff nhấn "Check-in"
   → Status: 'checked-in' 🟢
   → checkInTime: Date.now()

8. SỬ DỤNG DỊCH VỤ
   ↓
   Khách sử dụng phòng trong khoảng thời gian đã đặt

9. CHECK-OUT
   ↓
   [Checked-in] → Hết giờ hoặc khách checkout sớm
   → Admin/Staff nhấn "Check-out"
   → Status: 'checked-out' ✅
   → checkOutTime: Date.now()

10. HỦY BOOKING (Optional - Any time before check-in)
    ↓
    [Pending/Confirmed] → Khách/Admin hủy booking
    → Status: 'cancelled' ❌
    → cancelledAt: Date.now()
    → cancelReason: string
    → PaymentStatus: 'refunded' (nếu đã thanh toán)
```

---

## 📊 Booking Status (5 trạng thái)

### 1. **pending** 🟡 (Chờ xác nhận)
**Điều kiện:**
- Booking vừa được tạo
- Chưa thanh toán hoặc thanh toán đang xử lý

**Hành động có thể:**
- ✅ Thanh toán → `confirmed`
- ✅ Hủy → `cancelled`
- ✅ Chỉnh sửa thông tin

**Tự động chuyển:**
- ⏰ Sau 15 phút không thanh toán → `cancelled` (nếu có auto-cancel policy)

---

### 2. **confirmed** 🟢 (Đã xác nhận)
**Điều kiện:**
- Đã thanh toán thành công
- PaymentStatus: `paid`
- Booking được xác nhận

**Hành động có thể:**
- ✅ Check-in (khi đến giờ) → `checked-in`
- ✅ Hủy (với phí/không phí tùy policy) → `cancelled`
- ❌ Không thể chỉnh sửa (phải hủy và tạo mới)

**Tự động chuyển:**
- ⏰ Quá giờ startTime + 30 phút mà không check-in → `cancelled` (no-show)

---

### 3. **checked-in** 🔵 (Đang sử dụng)
**Điều kiện:**
- Khách đã đến và check-in tại quầy
- checkInTime được ghi nhận
- Đang trong thời gian sử dụng phòng

**Hành động có thể:**
- ✅ Check-out → `checked-out`
- ❌ Không thể hủy
- ❌ Không thể chỉnh sửa

**Tự động chuyển:**
- ⏰ Quá giờ endTime + buffer → `checked-out` (auto checkout)

---

### 4. **checked-out** ✅ (Hoàn thành)
**Điều kiện:**
- Đã check-out
- checkOutTime được ghi nhận
- Hoàn thành dịch vụ

**Hành động có thể:**
- ✅ Xem lại thông tin (read-only)
- ✅ Xuất hóa đơn/biên lai
- ❌ Không thể thay đổi

**Trạng thái cuối:**
- ✅ Completed - Booking kết thúc thành công

---

### 5. **cancelled** ❌ (Đã hủy)
**Điều kiện:**
- Bị hủy bởi khách hàng/admin/hệ thống
- cancelledAt và cancelReason được ghi nhận

**Lý do hủy:**
- Khách hủy tự nguyện
- Không thanh toán (timeout)
- No-show (không đến check-in)
- Admin hủy (vi phạm policy, force majeure)

**Hành động có thể:**
- ✅ Xem lại thông tin (read-only)
- ✅ Hoàn tiền (nếu đã thanh toán) → PaymentStatus: `refunded`
- ❌ Không thể khôi phục

**Trạng thái cuối:**
- ❌ Booking kết thúc không thành công

---

## 💳 Payment Status (3 trạng thái)

### 1. **unpaid** 🟡 (Chưa thanh toán)
- Booking tạo mới, chưa thanh toán
- Status: `pending`

### 2. **paid** 🟢 (Đã thanh toán)
- Thanh toán thành công
- Status: `confirmed` → `checked-in` → `checked-out`

### 3. **refunded** 🔄 (Đã hoàn tiền)
- Booking bị hủy sau khi đã thanh toán
- Status: `cancelled`
- Tiền được hoàn lại theo policy

---

## 🕐 Time Validation Rules

### ✅ Quy tắc thời gian hợp lệ:

1. **Không được đặt giờ quá khứ:**
   ```javascript
   const now = new Date()
   const minBookingTime = new Date(now.getTime() + 5 * 60 * 1000) // +5 phút
   
   if (startTime < minBookingTime) {
     ❌ Error: "Không thể đặt phòng cho giờ quá khứ. Vui lòng chọn giờ ít nhất 5 phút sau thời điểm hiện tại."
   }
   ```

2. **endTime phải sau startTime:**
   ```javascript
   if (endTime <= startTime) {
     ❌ Error: "Giờ kết thúc phải sau giờ bắt đầu"
   }
   ```

3. **Duration tối thiểu:** 1 giờ (có thể điều chỉnh)
   ```javascript
   const minDuration = 1 * 60 * 60 * 1000 // 1 giờ
   if (endTime - startTime < minDuration) {
     ❌ Error: "Thời gian đặt phòng tối thiểu là 1 giờ"
   }
   ```

4. **Không trùng booking khác:**
   ```javascript
   // Check conflict với status: pending, confirmed, checked-in
   const conflict = await Booking.findOne({
     roomId,
     status: { $in: ['pending', 'confirmed', 'checked-in'] },
     $or: [
       { startTime: { $lt: endTime }, endTime: { $gt: startTime } },
     ],
   })
   
   if (conflict) {
     ❌ Error: "Phòng đã được đặt trong khung giờ này"
   }
   ```

---

## 🎯 Business Rules

### Booking Creation:
- ✅ Phải chọn giờ ít nhất 5 phút sau hiện tại
- ✅ Duration tối thiểu: 1 giờ
- ✅ Duration tối đa: 24 giờ (1 ngày)
- ✅ Phải điền đầy đủ: name, phone, startTime, endTime
- ✅ Không được trùng với booking khác (conflict check)

### Payment:
- ✅ Thanh toán trong 15 phút sau khi tạo booking
- ✅ Nếu quá 15 phút → auto cancel (optional policy)

### Check-in:
- ✅ Chỉ check-in được trong khoảng: startTime - 15 phút → startTime + 30 phút
- ✅ Quá 30 phút mà không check-in → auto cancel (no-show)

### Check-out:
- ✅ Có thể checkout sớm (early checkout)
- ✅ Checkout muộn → tính phí thêm (overtime fee)

### Cancellation:
- ✅ Hủy trước startTime > 2 giờ → Hoàn tiền 100%
- ✅ Hủy trước startTime 1-2 giờ → Hoàn tiền 50%
- ✅ Hủy trước startTime < 1 giờ → Không hoàn tiền
- ✅ No-show → Không hoàn tiền

---

## 📈 Status Flow Diagram

```
        ┌──────────┐
        │ pending  │ ← Booking created
        └────┬─────┘
             │
      ┌──────┴──────┐
      │             │
   Pay?          Timeout?
      │             │
   ✅ Yes        ✅ Yes
      │             │
      ▼             ▼
 ┌──────────┐  ┌──────────┐
 │confirmed │  │cancelled │
 └────┬─────┘  └──────────┘
      │              ▲
   Check-in?         │
      │              │
   ✅ Yes        ❌ Cancel
      │         (anytime)
      ▼              │
 ┌──────────┐       │
 │checked-in│───────┘
 └────┬─────┘
      │
   Check-out?
      │
   ✅ Yes
      ▼
 ┌───────────┐
 │checked-out│ ← Completed ✅
 └───────────┘
```

---

## 🔧 Implementation Checklist

### API Validation:
- [ ] ✅ Check startTime >= now + 5 minutes
- [ ] ✅ Check endTime > startTime
- [ ] ✅ Check duration >= 1 hour
- [ ] ✅ Check no booking conflict
- [ ] ✅ Validate customer info (name, phone)

### Frontend Validation:
- [ ] ✅ Disable past dates in date picker
- [ ] ✅ Disable past hours in time picker
- [ ] ✅ Show real-time availability
- [ ] ✅ Calculate price dynamically
- [ ] ✅ Show clear error messages

### Status Transitions:
- [ ] ✅ pending → confirmed (after payment)
- [ ] ✅ confirmed → checked-in (at check-in time)
- [ ] ✅ checked-in → checked-out (at check-out)
- [ ] ✅ * → cancelled (cancellation flow)

---

## 🧪 Test Cases

### Test 1: Book giờ quá khứ
```
Input: startTime = now - 1 hour
Expected: ❌ Error "Không thể đặt phòng cho giờ quá khứ"
```

### Test 2: Book giờ hiện tại (trong vòng 5 phút)
```
Input: startTime = now + 2 minutes
Expected: ❌ Error "Vui lòng chọn giờ ít nhất 5 phút sau"
```

### Test 3: Book giờ hợp lệ
```
Input: startTime = now + 10 minutes
Expected: ✅ Success
```

### Test 4: endTime trước startTime
```
Input: endTime < startTime
Expected: ❌ Error "Giờ kết thúc phải sau giờ bắt đầu"
```

### Test 5: Duration < 1 giờ
```
Input: endTime - startTime = 30 minutes
Expected: ❌ Error "Thời gian đặt tối thiểu là 1 giờ"
```

### Test 6: Conflict booking
```
Input: startTime overlap với booking khác
Expected: ❌ Error "Phòng đã được đặt"
```

---

## ✅ Summary

**Booking có 5 trạng thái chính:**
1. **pending** - Chờ thanh toán
2. **confirmed** - Đã xác nhận
3. **checked-in** - Đang sử dụng
4. **checked-out** - Hoàn thành ✅
5. **cancelled** - Đã hủy ❌

**Time Validation:**
- ✅ startTime >= now + 5 phút
- ✅ endTime > startTime
- ✅ duration >= 1 giờ
- ✅ Không conflict với booking khác

**Payment Flow:**
- unpaid → paid → (refunded nếu cancel)

Ready to implement! 🚀
