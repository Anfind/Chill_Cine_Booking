# 🌱 Seed Data Logic - Smart Status Assignment

**Ngày cập nhật:** 17 Oct 2025  
**Vấn đề:** Seed data cũ tạo booking `checked-in` cho thời gian chưa đến → Vô lý!  
**Giải pháp:** Logic thông minh dựa trên thời gian thực tế

---

## ❌ Vấn đề Cũ

### Code cũ:
```typescript
// ❌ BAD: Hard-coded status không quan tâm thời gian
status: i < 2 ? 'confirmed' : i < 4 ? 'checked-in' : 'pending'
```

### Kết quả:
```
Booking #3: 14:00-18:00 → Status: checked-in
Booking #4: 16:00-20:00 → Status: checked-in

Hiện tại: 10:00 (sáng)
❌ VÔ LÝ: Booking chưa đến giờ mà đã "đang sử dụng"!
```

---

## ✅ Logic Mới - Thông Minh

### Code mới:
```typescript
const now = new Date() // Thời gian thực tế khi chạy seed

if (now > endTime) {
  // Đã qua giờ endTime → checked-out
  status = 'checked-out'
  checkInTime = startTime + 5 phút
  checkOutTime = endTime
  
} else if (now >= startTime && now < endTime) {
  // Đang trong khoảng startTime - endTime → checked-in
  status = 'checked-in'
  checkInTime = startTime + 5 phút
  
} else if (now < startTime) {
  // Chưa đến giờ → confirmed/pending
  status = i % 2 === 0 ? 'confirmed' : 'pending'
}
```

---

## 📅 Seed Data Structure

### Hôm Nay (17/10/2025) - 6 Bookings

| # | Thời gian | Status Logic | Giải thích |
|---|-----------|--------------|------------|
| 1 | 08:00-12:00 | `checked-out` (nếu now > 12:00) | Đã qua giờ → đã trả phòng |
| 2 | 10:00-14:00 | `checked-out` hoặc `checked-in` | Tùy giờ chạy seed |
| 3 | 12:00-16:00 | `checked-in` (nếu 12:00 < now < 16:00) | Đang sử dụng |
| 4 | 14:00-18:00 | `checked-in` hoặc `confirmed` | Tùy giờ chạy seed |
| 5 | 16:00-20:00 | `confirmed` (nếu now < 16:00) | Sắp tới, đã thanh toán |
| 6 | 18:00-22:00 | `pending` (nếu now < 18:00) | Sắp tới, chưa thanh toán |

### Ngày Mai (18/10/2025) - 8 Bookings

| # | Thời gian | Status | Giải thích |
|---|-----------|--------|------------|
| 1 | 10:00-14:00 | `confirmed` | Chưa đến ngày → đã xác nhận |
| 2 | 12:00-16:00 | `confirmed` | Chưa đến ngày → đã xác nhận |
| 3 | 14:00-18:00 | `confirmed` | Chưa đến ngày → đã xác nhận |
| 4 | 16:00-20:00 | `confirmed` | Chưa đến ngày → đã xác nhận |
| 5 | 18:00-22:00 | `pending` | Chưa đến ngày → chờ xác nhận |
| 6 | 20:00-00:00 | `pending` | Chưa đến ngày → chờ xác nhận |
| 7 | 22:00-02:00 | `pending` | Chưa đến ngày → chờ xác nhận |
| 8 | 00:00-04:00 | `pending` | Chưa đến ngày → chờ xác nhận |

---

## 🕐 Status Based on Current Time

### Ví dụ: Chạy seed lúc 10:00 (sáng)

```
Booking 1: 08:00-12:00
now (10:00) >= startTime (08:00) && now < endTime (12:00)
→ Status: checked-in ✅ (đang sử dụng)

Booking 2: 10:00-14:00
now (10:00) >= startTime (10:00) && now < endTime (14:00)
→ Status: checked-in ✅ (vừa bắt đầu)

Booking 3: 12:00-16:00
now (10:00) < startTime (12:00)
→ Status: confirmed ✅ (sắp tới, đã thanh toán)

Booking 4: 14:00-18:00
now (10:00) < startTime (14:00)
→ Status: pending ✅ (sắp tới, chưa thanh toán)
```

### Ví dụ: Chạy seed lúc 15:00 (chiều)

```
Booking 1: 08:00-12:00
now (15:00) > endTime (12:00)
→ Status: checked-out ✅ (đã kết thúc)
→ checkInTime: 08:05, checkOutTime: 12:00

Booking 2: 10:00-14:00
now (15:00) > endTime (14:00)
→ Status: checked-out ✅ (đã kết thúc)

Booking 3: 12:00-16:00
now (15:00) >= startTime (12:00) && now < endTime (16:00)
→ Status: checked-in ✅ (đang sử dụng)

Booking 4: 14:00-18:00
now (15:00) >= startTime (14:00) && now < endTime (18:00)
→ Status: checked-in ✅ (đang sử dụng)

Booking 5: 16:00-20:00
now (15:00) < startTime (16:00)
→ Status: confirmed ✅ (sắp tới)

Booking 6: 18:00-22:00
now (15:00) < startTime (18:00)
→ Status: pending ✅ (sắp tới)
```

---

## 🎯 Check-in Logic

### Rule:
- **checked-in** chỉ khi:
  1. ✅ Đã đến giờ `startTime` (hoặc quá 5 phút)
  2. ✅ Chưa đến giờ `endTime`
  3. ✅ Admin bấm "Check-in" thủ công

### Auto Check-in (Future):
```typescript
// Cron job chạy mỗi 5 phút
const autoCheckIn = async () => {
  const now = new Date()
  const fiveMinutesAgo = new Date(now.getTime() - 5 * 60 * 1000)
  
  // Tìm booking confirmed, đã quá giờ startTime 5 phút
  const bookingsToCheckIn = await Booking.find({
    status: 'confirmed',
    startTime: { $lte: fiveMinutesAgo }
  })
  
  // Auto check-in
  for (const booking of bookingsToCheckIn) {
    booking.status = 'checked-in'
    booking.checkInTime = now
    await booking.save()
  }
}
```

### Manual Check-in (Current):
```typescript
// Admin click "Check-in" button
PUT /api/bookings/{id}
{
  "status": "checked-in"
}

// Backend set checkInTime
booking.checkInTime = new Date()
booking.status = 'checked-in'
await booking.save()
```

---

## 🔍 Status Flow

```
┌─────────┐
│ pending │ ← Vừa tạo, chưa thanh toán
└────┬────┘
     │ Thanh toán
     ↓
┌───────────┐
│ confirmed │ ← Đã thanh toán, chưa đến giờ
└─────┬─────┘
      │ Đến giờ startTime + 5 phút
      │ (Auto hoặc Admin click)
      ↓
┌────────────┐
│ checked-in │ ← Đang sử dụng phòng
└──────┬─────┘
       │ Admin click "Check-out"
       ↓
┌─────────────┐
│ checked-out │ ← Đã trả phòng
└─────────────┘
```

---

## 📊 Seed Summary Output

```bash
🎉 Database seeded successfully!
📊 Summary:
   - Cities: 4
   - Branches: 7
   - Room Types: 3
   - Rooms: 28
   - Combo Packages: 6
   - Menu Items: 5
   - Sample Bookings: 14
   - Admin User: 1

📅 Booking dates:
   - Today (17/10/2025): 6 bookings
   - Tomorrow (18/10/2025): 8 bookings

📋 Today's booking status (based on current time):
   - Checked-out: Past bookings (ended before now)
   - Checked-in: Ongoing bookings (started, not ended yet)
   - Confirmed: Upcoming paid bookings
   - Pending: Upcoming unpaid bookings
```

---

## 🧪 Test Cases

### Test 1: Seed lúc 9:00 (sáng)
```
Expected:
- 08:00-12:00 → checked-in (đang sử dụng)
- 10:00-14:00 → checked-in hoặc confirmed (tùy logic)
- 12:00-16:00 → confirmed (chưa đến giờ)
- 14:00-18:00 → pending (chưa đến giờ)
- 16:00-20:00 → confirmed (chưa đến giờ)
- 18:00-22:00 → pending (chưa đến giờ)
```

### Test 2: Seed lúc 14:00 (chiều)
```
Expected:
- 08:00-12:00 → checked-out (đã qua giờ)
- 10:00-14:00 → checked-out (đã qua giờ)
- 12:00-16:00 → checked-in (đang sử dụng)
- 14:00-18:00 → checked-in (vừa bắt đầu)
- 16:00-20:00 → confirmed (chưa đến giờ)
- 18:00-22:00 → pending (chưa đến giờ)
```

### Test 3: Seed lúc 23:00 (đêm)
```
Expected:
- 08:00-12:00 → checked-out (đã qua giờ)
- 10:00-14:00 → checked-out (đã qua giờ)
- 12:00-16:00 → checked-out (đã qua giờ)
- 14:00-18:00 → checked-out (đã qua giờ)
- 16:00-20:00 → checked-out (đã qua giờ)
- 18:00-22:00 → checked-out (đã qua giờ)
```

---

## ✅ Benefits

### Before:
- ❌ Hard-coded status
- ❌ Booking "checked-in" chưa đến giờ
- ❌ Không realistic
- ❌ Timeline hiển thị sai

### After:
- ✅ Dynamic status based on time
- ✅ Logic đúng với thực tế
- ✅ Realistic demo data
- ✅ Timeline chính xác

---

## 🔧 Maintenance

### Thay đổi ngày seed:
```typescript
// Muốn seed cho 3 ngày (hôm nay, mai, ngày kia)
const dayAfterTomorrow = new Date(tomorrow)
dayAfterTomorrow.setDate(dayAfterTomorrow.getDate() + 1)

// Add more loops...
```

### Thay đổi số lượng booking:
```typescript
// Tăng từ 6 → 10 bookings/ngày
for (let i = 0; i < 10; i++) {
  // ...
}
```

### Thay đổi khung giờ:
```typescript
// Thay vì 8:00, 10:00, 12:00...
// Có thể: 9:00, 11:00, 13:00...
const startHour = 9 + (i * 2)
```

---

## 🎉 Result

**Smart seed data với status logic thực tế!**

- ✅ Booking hôm nay: Status dựa trên thời gian chạy seed
- ✅ Booking ngày mai: Tất cả confirmed/pending
- ✅ checkInTime/checkOutTime chính xác
- ✅ Timeline hiển thị đúng
- ✅ Ready for demo!

**Run command:**
```bash
pnpm db:seed
```

**Reset DB mỗi khi cần test fresh data!** 🚀
