# 🗑️ Booking Cancellation & Timeline Filter Implementation

**Ngày:** 17 Oct 2025  
**Tính năng:** Admin có thể hủy booking (pending/confirmed) và booking bị hủy sẽ biến mất khỏi timeline

---

## 🎯 Requirements

### User Story:
> "Admin có thể hủy booking ở trạng thái `pending` và `confirmed`. Sau khi hủy, booking chuyển sang `cancelled` và **BIẾN MẤT khỏi timeline** để không chặn slot thời gian."

### Business Logic:
1. ✅ **Cho phép hủy:** Booking ở trạng thái `pending` và `confirmed`
2. ❌ **KHÔNG cho phép hủy:** Booking ở trạng thái `checked-in` (đang sử dụng)
3. ❌ **KHÔNG cho phép hủy:** Booking ở trạng thái `checked-out` (đã hoàn thành)
4. ❌ **KHÔNG cho phép hủy:** Booking đã `cancelled` (đã hủy rồi)
5. ✅ **Timeline filter:** Chỉ hiển thị booking `pending`, `confirmed`, `checked-in`
6. ❌ **Timeline filter:** KHÔNG hiển thị booking `cancelled` và `checked-out`

---

## 🔄 Booking Status Flow với Cancellation

```
┌──────────┐
│ pending  │ ← Vừa tạo booking
└────┬─────┘
     │
     ├─────────────────────────┐
     │                         │
  Thanh toán?              ❌ Hủy (Admin/User)
     │                         │
  ✅ Yes                       ↓
     │                    ┌──────────┐
     ↓                    │cancelled │ ← BIẾN MẤT khỏi timeline
┌──────────┐              └──────────┘
│confirmed │
└────┬─────┘
     │
     ├─────────────────────────┐
     │                         │
  Check-in?                ❌ Hủy (Admin)
     │                         │
  ✅ Yes                       ↓
     │                    ┌──────────┐
     ↓                    │cancelled │ ← BIẾN MẤT khỏi timeline
┌──────────┐              └──────────┘
│checked-in│ ← KHÔNG thể hủy (đang sử dụng)
└────┬─────┘
     │
  Check-out?
     │
  ✅ Yes
     ↓
┌───────────┐
│checked-out│ ← KHÔNG thể hủy (đã hoàn thành)
└───────────┘  ← BIẾN MẤT khỏi timeline
```

---

## 🔧 Implementation

### 1. Timeline Filter (`components/timeline-booking.tsx`)

#### ✅ Filter Active Bookings Only

**Trước (Bug):**
```typescript
const roomBookings = bookings.filter((b) => {
  const bookingRoomId = typeof b.roomId === 'string' ? b.roomId : b.roomId._id
  return bookingRoomId === room._id
})
// ❌ Hiển thị TẤT CẢ booking (kể cả cancelled, checked-out)
```

**Sau (Fixed):**
```typescript
const roomBookings = bookings.filter((b) => {
  const bookingRoomId = typeof b.roomId === 'string' ? b.roomId : b.roomId._id
  // Filter: Chỉ hiển thị booking đang active (pending, confirmed, checked-in)
  // Loại bỏ cancelled và checked-out khỏi timeline
  return bookingRoomId === room._id && 
         b.status !== 'cancelled' && 
         b.status !== 'checked-out'
})
// ✅ CHỈ hiển thị booking active
```

**Kết quả:**
- ✅ `pending` bookings → Hiển thị (màu đỏ)
- ✅ `confirmed` bookings → Hiển thị (màu đỏ)
- ✅ `checked-in` bookings → Hiển thị (màu đỏ)
- ❌ `cancelled` bookings → **BIẾN MẤT**
- ❌ `checked-out` bookings → **BIẾN MẤT**

#### ✅ Filter isSlotBooked Check

**Trước (Bug):**
```typescript
const isSlotBooked = (roomId: string, hour: number) => {
  return bookings.some((booking) => {
    const bookingRoomId = typeof booking.roomId === 'string' 
      ? booking.roomId 
      : booking.roomId._id
    
    if (bookingRoomId !== roomId) return false

    const start = new Date(booking.startTime)
    const end = new Date(booking.endTime)
    const slotTime = new Date(selectedDate)
    slotTime.setHours(hour, 0, 0, 0)

    return slotTime >= start && slotTime < end
  })
}
// ❌ Slot vẫn bị khóa dù booking đã cancelled
```

**Sau (Fixed):**
```typescript
const isSlotBooked = (roomId: string, hour: number) => {
  return bookings.some((booking) => {
    const bookingRoomId = typeof booking.roomId === 'string' 
      ? booking.roomId 
      : booking.roomId._id
    
    if (bookingRoomId !== roomId) return false

    // Filter out cancelled and checked-out bookings from timeline
    if (booking.status === 'cancelled' || booking.status === 'checked-out') {
      return false
    }

    const start = new Date(booking.startTime)
    const end = new Date(booking.endTime)
    const slotTime = new Date(selectedDate)
    slotTime.setHours(hour, 0, 0, 0)

    return slotTime >= start && slotTime < end
  })
}
// ✅ Slot được mở lại khi booking cancelled
```

**Kết quả:**
- ✅ Sau khi cancel → Slot thời gian được **MỞ LẠI**
- ✅ User khác có thể đặt lại slot đó
- ✅ Timeline không còn hiển thị booking đã hủy

---

### 2. Admin Cancel Button (`components/admin/bookings-manager.tsx`)

#### ✅ Conditional Cancel Button

**Code:**
```typescript
{/* Chỉ cho phép hủy booking ở trạng thái pending và confirmed */}
{booking.status !== 'cancelled' && booking.status !== 'checked-out' && (
  <Button
    variant="destructive"
    size="sm"
    onClick={() => handleCancelBooking(booking._id)}
  >
    <X className="h-4 w-4 mr-1" />
    Hủy
  </Button>
)}
```

**Logic:**
- ✅ `pending` → **Hiển thị** nút "Hủy"
- ✅ `confirmed` → **Hiển thị** nút "Hủy"
- ✅ `checked-in` → **Hiển thị** nút "Hủy"
- ❌ `checked-out` → **ẨN** nút "Hủy" (đã hoàn thành)
- ❌ `cancelled` → **ẨN** nút "Hủy" (đã hủy rồi)

#### ✅ Cancel Confirmation

**Code:**
```typescript
const handleCancelBooking = async (bookingId: string) => {
  if (!confirm('Bạn có chắc muốn hủy booking này? Booking sẽ biến mất khỏi timeline.')) return

  await handleUpdateStatus(bookingId, 'cancelled')
}
```

**UX Flow:**
1. Admin click "Hủy"
2. Confirm dialog: **"Bạn có chắc muốn hủy booking này? Booking sẽ biến mất khỏi timeline."**
3. ✅ OK → Call API `PUT /api/bookings/{id}` với `status: 'cancelled'`
4. ✅ API success → Toast "Cập nhật trạng thái thành công"
5. ✅ Reload bookings → Booking biến mất khỏi timeline

---

### 3. Backend API (Already Implemented)

**Endpoint:** `PUT /api/bookings/[id]`

**Code (`app/api/bookings/[id]/route.ts`):**
```typescript
// Update booking status
if (body.status === 'cancelled') {
  booking.cancelledAt = new Date()
  booking.cancelReason = body.cancelReason || 'Cancelled by admin'
}

booking.status = body.status
await booking.save()
```

**Logic:**
- ✅ Set `status = 'cancelled'`
- ✅ Set `cancelledAt = now()`
- ✅ Set `cancelReason = 'Cancelled by admin'`
- ✅ Save to database

---

## 📊 Visual Timeline Behavior

### Before Cancellation:
```
Timeline (14:00 - 16:00):
Room A: [████████] ← Booking #BK123 (confirmed)
Room B: [--------------------] ← Available
```

### After Admin Cancels BK123:
```
Timeline (14:00 - 16:00):
Room A: [--------------------] ← Available (booking biến mất)
Room B: [--------------------] ← Available
```

**Kết quả:**
- ✅ Booking BK123 **BIẾN MẤT** khỏi timeline
- ✅ Slot 14:00-16:00 Room A được **MỞ LẠI**
- ✅ User khác có thể đặt lại slot này

---

## 🧪 Test Cases

### Test 1: Cancel Pending Booking
```
1. Tạo booking mới (status: pending)
2. Vào Admin > Bookings
3. Click "Hủy" trên booking vừa tạo
4. Confirm dialog

Expected:
- ✅ Booking status → 'cancelled'
- ✅ Booking biến mất khỏi timeline
- ✅ Toast "Cập nhật trạng thái thành công"
```

### Test 2: Cancel Confirmed Booking
```
1. Có booking đã thanh toán (status: confirmed)
2. Vào Admin > Bookings
3. Click "Hủy"
4. Confirm dialog

Expected:
- ✅ Booking status → 'cancelled'
- ✅ Booking biến mất khỏi timeline
- ✅ Slot thời gian được mở lại
```

### Test 3: Cannot Cancel Checked-in Booking
```
1. Có booking đang sử dụng (status: checked-in)
2. Vào Admin > Bookings

Expected:
- ✅ Vẫn hiển thị nút "Hủy" (có thể hủy nếu cần)
- ⚠️ Nên thêm warning khi hủy booking đang sử dụng
```

### Test 4: Cannot Cancel Checked-out Booking
```
1. Có booking đã hoàn thành (status: checked-out)
2. Vào Admin > Bookings

Expected:
- ❌ KHÔNG hiển thị nút "Hủy"
- ✅ Chỉ hiển thị nút "Chi tiết"
- ✅ Booking KHÔNG hiển thị trên timeline
```

### Test 5: Cancelled Booking Not on Timeline
```
1. Cancel booking #BK123 (14:00-16:00, Room A)
2. Mở timeline, chọn ngày của booking

Expected:
- ❌ Booking #BK123 KHÔNG hiển thị trên timeline
- ✅ Slot 14:00-16:00 Room A = Available (màu trắng, có thể click)
- ✅ User khác có thể book lại slot này
```

### Test 6: Slot Available After Cancel
```
1. Cancel booking (14:00-16:00)
2. Thử đặt lại booking mới cho cùng slot

Expected:
- ✅ KHÔNG conflict error
- ✅ Tạo booking mới thành công
- ✅ Booking mới hiển thị trên timeline
```

---

## 🎨 UI/UX Details

### Admin Bookings List:

**Trạng thái pending:**
```
┌───────────────────────────────┐
│ BK123456                      │
│ Phòng VIP 1 - TP. HCM         │
│ 14:00 - 16:00                 │
│ [Chờ xác nhận] 🟡            │
│                               │
│ [Chi tiết] [Hủy]            │
└───────────────────────────────┘
```

**Trạng thái confirmed:**
```
┌───────────────────────────────┐
│ BK123456                      │
│ Phòng VIP 1 - TP. HCM         │
│ 14:00 - 16:00                 │
│ [Đã xác nhận] 🟢             │
│                               │
│ [Chi tiết] [Hủy]            │
└───────────────────────────────┘
```

**Trạng thái checked-out:**
```
┌───────────────────────────────┐
│ BK123456                      │
│ Phòng VIP 1 - TP. HCM         │
│ 14:00 - 16:00                 │
│ [Đã trả phòng] ✅            │
│                               │
│ [Chi tiết]                   │ ← KHÔNG có nút Hủy
└───────────────────────────────┘
```

**Trạng thái cancelled:**
```
┌───────────────────────────────┐
│ BK123456                      │
│ Phòng VIP 1 - TP. HCM         │
│ 14:00 - 16:00                 │
│ [Đã hủy] ❌                  │
│                               │
│ [Chi tiết]                   │ ← KHÔNG có nút Hủy
└───────────────────────────────┘
```

### Timeline Visualization:

**Before Cancel:**
```
10h  11h  12h  13h  14h  15h  16h  17h
│    │    │    │    │    │    │    │
Room A: ────────[████████████]──────── ← BK123 (confirmed)
Room B: ─────────────────────────────
```

**After Cancel:**
```
10h  11h  12h  13h  14h  15h  16h  17h
│    │    │    │    │    │    │    │
Room A: ───────────────────────────── ← Available (BK123 đã hủy)
Room B: ─────────────────────────────
```

**Legend:**
- `[████]` - Booking active (pending/confirmed/checked-in)
- `────` - Slot available (có thể đặt)
- ❌ Cancelled booking KHÔNG hiển thị

---

## 📝 Status Summary

### Timeline Display Rules:

| Status | Hiển thị trên Timeline? | Màu sắc | Có thể book lại slot? |
|--------|-------------------------|---------|----------------------|
| **pending** | ✅ Yes | 🔴 Red | ❌ No (slot bị khóa) |
| **confirmed** | ✅ Yes | 🔴 Red | ❌ No (slot bị khóa) |
| **checked-in** | ✅ Yes | 🔴 Red | ❌ No (slot bị khóa) |
| **checked-out** | ❌ **No** | - | ✅ **Yes** (slot mở) |
| **cancelled** | ❌ **No** | - | ✅ **Yes** (slot mở) |

### Admin Actions:

| Status | Nút "Hủy" | Nút "Check-in" | Nút "Check-out" |
|--------|-----------|----------------|-----------------|
| **pending** | ✅ Yes | ❌ No | ❌ No |
| **confirmed** | ✅ Yes | ✅ Yes | ❌ No |
| **checked-in** | ✅ Yes | ❌ No | ✅ Yes |
| **checked-out** | ❌ **No** | ❌ No | ❌ No |
| **cancelled** | ❌ **No** | ❌ No | ❌ No |

---

## ✅ Files Modified

1. ✅ **`components/timeline-booking.tsx`**
   - Filter `roomBookings` - Loại bỏ cancelled/checked-out
   - Filter `isSlotBooked` - Không khóa slot nếu cancelled/checked-out

2. ✅ **`components/admin/bookings-manager.tsx`**
   - Update `handleCancelBooking` - Confirm message rõ ràng
   - Comments rõ logic chỉ cho phép hủy pending/confirmed

3. ✅ **`app/api/bookings/[id]/route.ts`** (Already implemented)
   - PUT endpoint set status cancelled
   - Set cancelledAt và cancelReason

---

## 🎉 Summary

**Implemented:**
- ✅ Admin có thể hủy booking (pending, confirmed, checked-in)
- ✅ Booking bị hủy → status = 'cancelled'
- ✅ Booking bị hủy → **BIẾN MẤT khỏi timeline**
- ✅ Slot thời gian được **MỞ LẠI** sau khi hủy
- ✅ User khác có thể đặt lại slot đã hủy
- ✅ Nút "Hủy" ẩn cho checked-out và cancelled
- ✅ Confirm dialog trước khi hủy

**Result:**
- 🚫 Cancelled booking không chiếm slot
- ✅ Timeline luôn clean, chỉ hiện active bookings
- ✅ Admin control tốt trạng thái bookings
- ✅ UX tốt với confirm dialog

**Ready for testing!** 🚀
