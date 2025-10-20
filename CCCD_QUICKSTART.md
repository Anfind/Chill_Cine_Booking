# ✅ CCCD Feature - Quick Start Guide

## Đã Hoàn Thành

✅ **Booking Model** - Thêm field `cccd` (required, 9 or 12 digits)
✅ **API Validation** - Backend validate CCCD format
✅ **Form UI** - Input CCCD với real-time validation
✅ **Seed Data** - Sample CCCD cho tất cả bookings
✅ **Test Scripts** - Update với CCCD field

---

## Test Ngay

### 1. Seed Database (Bắt Buộc!)
```bash
pnpm seed
```
→ Tạo data mới với CCCD

### 2. Restart Dev Server
```bash
Ctrl+C
pnpm dev
```

### 3. Test Booking Form
1. Vào http://localhost:3000
2. Chọn chi nhánh → phòng
3. Điền form:
   - Họ tên: Nguyễn Văn A
   - SĐT: 0123456789
   - **CCCD: 001202300001** ← MỚI!
4. Chọn combo + thời gian
5. Submit

**Expected:**
- ✅ Form validate CCCD (12 số)
- ✅ API accept booking
- ✅ Redirect to payment page

---

## Validation Rules

### ✅ Valid:
- `123456789` (CMND 9 số)
- `001202300001` (CCCD 12 số)

### ❌ Invalid:
- `12345` (quá ngắn)
- `ABC123` (có chữ cái)
- `` (trống)

---

## UI Features

🎨 **Input CCCD:**
- Auto-filter: Chỉ cho nhập số
- Max length: 12
- Real-time validation: Border đỏ nếu sai
- Error message: "CCCD phải là 12 chữ số hoặc CMND cũ 9 chữ số"
- Hint: "* Bắt buộc theo quy định pháp luật về lưu trú"

---

## Files Changed

1. `lib/models/Booking.ts` - Model + validation
2. `app/api/bookings/route.ts` - API validation
3. `components/booking-form.tsx` - UI + client validation
4. `lib/scripts/seed.ts` - Sample data
5. `scripts/create-test-booking.js` - Test script

---

## Next Steps

1. **Test payment flow với CCCD:**
   - Tạo booking mới
   - Check payment page hiện booking info
   - Verify CCCD được lưu vào database

2. **Check MongoDB:**
   ```bash
   mongosh mongodb://localhost:27017/chill-cine-hotel
   > db.bookings.findOne({}, {customerInfo: 1})
   ```
   → Should see `cccd` field

3. **Test với số CMND 9 số:**
   - Input: `123456789`
   - Should accept ✅

---

## Troubleshooting

### Lỗi: "Missing required field: cccd"
→ **Fix:** Run `pnpm seed` to reset database with CCCD data

### UI: Input không hiện
→ **Fix:** Restart dev server (`Ctrl+C` then `pnpm dev`)

### Validation không chạy
→ **Fix:** Check browser console for errors

---

Chi tiết đầy đủ xem file `CCCD_FEATURE.md` 📄
