# 🐛 Fix: Amount = 0 Issue

## Vấn Đề
Booking được tạo với `amount: 0` → Pay2S tự động mark as SUCCESS ngay lập tức

## Nguyên Nhân

### 1. **API Backend Tính Giá Sai**

File: `app/api/bookings/route.ts` (line 178 - CŨ)

```typescript
// SAI: Expect comboPrice từ client, nhưng client không gửi
const roomTotal = body.comboPackageId ? body.comboPrice || 0 : room.pricePerHour * duration
```

→ Khi có `comboPackageId` nhưng không có `comboPrice` → `roomTotal = 0`

### 2. **Client Gửi Sai Format**

File: `components/booking-form.tsx` (line 227)

```tsx
const bookingData = {
  roomId: room._id,
  services: {  // ← API backend không expect field "services"
    comboPackageId: selectedCombo,
    menuItems: [...]
  }
}
```

→ `body.comboPackageId` = undefined → Dùng fallback `body.comboPrice || 0` → 0

## Giải Pháp

### ✅ Fix 1: Fetch Combo Price Từ Database

**File:** `app/api/bookings/route.ts`

```typescript
// Calculate pricing
let roomTotal = 0

// If combo package is selected, fetch its price from database
if (body.comboPackageId || body.services?.comboPackageId) {
  const comboId = body.comboPackageId || body.services?.comboPackageId
  const ComboPackage = (await import('@/lib/models/ComboPackage')).default
  const combo = await ComboPackage.findById(comboId)
  if (combo) {
    roomTotal = combo.price  // ← Lấy giá từ DB, không tin client
  } else {
    // Fallback to hourly rate if combo not found
    roomTotal = room.pricePerHour * duration
  }
} else {
  // No combo, use hourly rate
  roomTotal = room.pricePerHour * duration
}

// Extract menu items from either format
const menuItems = body.menuItems || body.services?.menuItems || []
const menuTotal = menuItems.reduce((sum, item) => sum + item.subtotal, 0) || 0
const subtotal = roomTotal + menuTotal
```

### ✅ Fix 2: Support Cả 2 Formats

```typescript
// Create booking
const booking = await Booking.create({
  // ...
  comboPackageId: body.comboPackageId || body.services?.comboPackageId || undefined,
  menuItems: body.menuItems || body.services?.menuItems || [],
  // ...
})
```

## Kết Quả

### Trước Fix:
```json
{
  "amount": 0,  // ← SAI!
  "resultCode": 0,
  "message": "Paymentsuccessful"
}
```

### Sau Fix:
```json
{
  "amount": 50,  // ← ĐÚNG! (combo price = 1 + menu + tax)
  "resultCode": 1001,  // ← PENDING (chưa thanh toán)
  "message": "Payment pending"
}
```

## Testing

### 1. Restart Dev Server
```bash
Ctrl+C
pnpm dev
```

### 2. Test Booking Mới
1. Tạo booking qua UI
2. Kiểm tra terminal logs:
   ```
   📝 Pay2S Create Payment Request: {
     amount: 50,  // ← Phải > 0
     ...
   }
   ```

3. IPN callback sẽ có `resultCode: 1001` (PENDING)
4. Log sẽ hiện: `⏭️  Skipping IPN - resultCode 1001 is not success`
5. Booking vẫn `unpaid`, QR vẫn hiển thị ✅

### 3. Test Thanh Toán Thật
1. Quét QR bằng app ngân hàng
2. Chuyển tiền đúng số tiền
3. Đợi webhook callback với `resultCode: 0`
4. Trang tự động redirect sang success ✅

## Notes

- **Combo price = 1đ** trong seed data (để test)
- Nếu muốn giá thật → Uncomment trong `lib/scripts/seed.ts`
- Pay2S **auto-approve** transaction 0đ → Luôn phải test với số tiền > 0
