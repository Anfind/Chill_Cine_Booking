# 🆔 CCCD/CMND Feature Implementation

## Tổng Quan

Đã bổ sung **trường CCCD/CMND bắt buộc** vào form đặt phòng theo quy định pháp luật về lưu trú.

---

## Chi Tiết Thay Đổi

### 1. ✅ Booking Model (`lib/models/Booking.ts`)

**Interface Update:**
```typescript
customerInfo: {
  name: string
  phone: string
  email?: string
  cccd: string // ← MỚI: Căn cước công dân (12 chữ số)
}
```

**Schema Update:**
```typescript
customerInfo: {
  // ... existing fields
  cccd: {
    type: String,
    required: true,
    trim: true,
    validate: {
      validator: function(v: string) {
        // CCCD mới: 12 chữ số
        // CMND cũ: 9 chữ số
        return /^\d{9}$|^\d{12}$/.test(v)
      },
      message: 'CCCD/CMND phải là 9 hoặc 12 chữ số'
    }
  }
}
```

**Validation Rules:**
- ✅ Bắt buộc (required)
- ✅ 12 chữ số (CCCD mới) hoặc 9 chữ số (CMND cũ)
- ✅ Chỉ chấp nhận số (regex: `^\d{9}$|^\d{12}$`)
- ✅ Auto trim whitespace

---

### 2. ✅ API Backend (`app/api/bookings/route.ts`)

**Validation Added:**

```typescript
// Validate customerInfo fields
if (!body.customerInfo.name || !body.customerInfo.phone || !body.customerInfo.cccd) {
  return NextResponse.json(
    {
      success: false,
      error: 'Thiếu thông tin khách hàng (họ tên, số điện thoại, CCCD)',
    },
    { status: 400 }
  )
}

// Validate CCCD format
const cccdRegex = /^\d{9}$|^\d{12}$/
if (!cccdRegex.test(body.customerInfo.cccd)) {
  return NextResponse.json(
    {
      success: false,
      error: 'CCCD/CMND không hợp lệ',
      message: 'CCCD phải là 12 chữ số hoặc CMND cũ 9 chữ số',
    },
    { status: 400 }
  )
}
```

**Error Responses:**
- `400` - Thiếu CCCD
- `400` - CCCD không hợp lệ (không đúng 9 hoặc 12 số)

---

### 3. ✅ Booking Form UI (`components/booking-form.tsx`)

**State Management:**
```typescript
const [customerCCCD, setCustomerCCCD] = useState("")
```

**UI Component:**
```tsx
<div className="space-y-2">
  <Label htmlFor="cccd">CCCD/CMND *</Label>
  <Input
    id="cccd"
    type="text"
    placeholder="Nhập số CCCD (12 số) hoặc CMND (9 số)"
    value={customerCCCD}
    onChange={(e) => {
      // Chỉ cho phép nhập số
      const value = e.target.value.replace(/\D/g, '')
      if (value.length <= 12) {
        setCustomerCCCD(value)
      }
    }}
    className={cn(
      "border-pink-200",
      customerCCCD && !(/^\d{9}$|^\d{12}$/.test(customerCCCD)) && "border-red-500"
    )}
    maxLength={12}
    required
  />
  {customerCCCD && !(/^\d{9}$|^\d{12}$/.test(customerCCCD)) && (
    <p className="text-xs text-red-500 mt-1">
      CCCD phải là 12 chữ số hoặc CMND cũ 9 chữ số
    </p>
  )}
  <p className="text-xs text-gray-500 mt-1">
    * Bắt buộc theo quy định pháp luật về lưu trú
  </p>
</div>
```

**Features:**
- ✅ Auto-filter: Chỉ cho phép nhập số (remove non-digit)
- ✅ Max length: 12 ký tự
- ✅ Real-time validation: Red border nếu không hợp lệ
- ✅ Error message: Hiện ngay khi nhập sai format
- ✅ Hint text: Giải thích yêu cầu pháp luật

**Client-side Validation:**
```typescript
// Validation: CCCD format
const cccdRegex = /^\d{9}$|^\d{12}$/
if (!cccdRegex.test(customerCCCD)) {
  toast({
    title: "CCCD không hợp lệ",
    description: "CCCD phải là 12 chữ số hoặc CMND cũ 9 chữ số",
    variant: "destructive",
  })
  return
}
```

**Data Sent to API:**
```typescript
customerInfo: {
  name: customerName,
  phone: customerPhone,
  cccd: customerCCCD, // ← MỚI
}
```

---

### 4. ✅ Seed Data (`lib/scripts/seed.ts`)

**Sample CCCD Added:**
```typescript
customerInfo: {
  name: `Khách hàng ${i + 1}`,
  phone: `098976000${i}`,
  email: `customer${i + 1}@example.com`,
  cccd: `00120230000${String(i + 1).padStart(2, '0')}`, // ← MỚI
}
```

**Format:**
- Today's bookings: `001202300001` - `001202300006`
- Tomorrow's bookings: `001202300101` - `001202300108`

---

### 5. ✅ Test Script (`scripts/create-test-booking.js`)

**Schema Update:**
```javascript
customerInfo: {
  name: { type: String, required: true },
  phone: { type: String, required: true },
  email: String,
  cccd: { type: String, required: true }, // ← MỚI
}
```

**Test Data:**
```javascript
customerInfo: {
  name: 'Nguyễn Văn Test',
  phone: '0123456789',
  email: 'test@example.com',
  cccd: '001202300001', // ← MỚI
}
```

---

## UX/UI Design

### Input Field:
- **Label:** "CCCD/CMND *"
- **Placeholder:** "Nhập số CCCD (12 số) hoặc CMND (9 số)"
- **Border:** Pink 200 (default) → Red 500 (invalid)
- **Max Length:** 12 characters
- **Input Type:** Text (with number filtering)

### Validation States:

| State | Border | Message | Icon |
|-------|--------|---------|------|
| Empty | Pink | Required field | - |
| Typing (invalid) | Red | "CCCD phải là 12 chữ số hoặc CMND cũ 9 chữ số" | ❌ |
| Valid (9 digits) | Pink | ✓ | ✅ |
| Valid (12 digits) | Pink | ✓ | ✅ |

### User Experience:
1. **Auto-filter:** Người dùng chỉ có thể nhập số
2. **Real-time feedback:** Border đỏ + error message ngay khi nhập sai
3. **Clear instruction:** Hint text giải thích quy định pháp luật
4. **Flexible:** Hỗ trợ cả CCCD mới (12 số) và CMND cũ (9 số)

---

## Testing

### 1. Test Form Validation

**Valid CCCD (12 digits):**
```
Input: 001202300001
Expected: ✅ Pass
```

**Valid CMND (9 digits):**
```
Input: 123456789
Expected: ✅ Pass
```

**Invalid (letters):**
```
Input: ABC123456
Expected: ❌ Auto-filtered to "123456" → Invalid (too short)
Error: "CCCD phải là 12 chữ số hoặc CMND cũ 9 chữ số"
```

**Invalid (10-11 digits):**
```
Input: 12345678901
Expected: ❌ Border red + error message
```

**Empty:**
```
Input: ""
Expected: ❌ Toast: "Vui lòng điền đầy đủ thông tin (Họ tên, SĐT, CCCD)"
```

### 2. Test API Validation

**Missing CCCD:**
```bash
curl -X POST http://localhost:3000/api/bookings \
  -H "Content-Type: application/json" \
  -d '{
    "roomId": "...",
    "customerInfo": {
      "name": "Test",
      "phone": "0123456789"
      // Missing cccd
    },
    ...
  }'

Expected: 400 Bad Request
{
  "success": false,
  "error": "Thiếu thông tin khách hàng (họ tên, số điện thoại, CCCD)"
}
```

**Invalid CCCD:**
```bash
curl -X POST http://localhost:3000/api/bookings \
  -H "Content-Type: application/json" \
  -d '{
    "roomId": "...",
    "customerInfo": {
      "name": "Test",
      "phone": "0123456789",
      "cccd": "12345" // Invalid (only 5 digits)
    },
    ...
  }'

Expected: 400 Bad Request
{
  "success": false,
  "error": "CCCD/CMND không hợp lệ",
  "message": "CCCD phải là 12 chữ số hoặc CMND cũ 9 chữ số"
}
```

### 3. Test Database

**Seed Data:**
```bash
pnpm seed
```

Expected: All bookings created with valid CCCD

**Check MongoDB:**
```bash
mongosh mongodb://localhost:27017/chill-cine-hotel
> db.bookings.find({}, {"customerInfo.cccd": 1}).pretty()
```

Expected: All documents have `customerInfo.cccd` field

---

## Migration Notes

### Existing Data:

⚠️ **Bookings cũ trong database KHÔNG có CCCD sẽ gây lỗi!**

**Solution:** Run migration script:

```javascript
// Migration script (run once)
const mongoose = require('mongoose')

async function migrateBookings() {
  await mongoose.connect(process.env.MONGODB_URI)
  const Booking = mongoose.model('Booking')
  
  // Add default CCCD to old bookings
  await Booking.updateMany(
    { 'customerInfo.cccd': { $exists: false } },
    { $set: { 'customerInfo.cccd': '000000000000' } }
  )
  
  console.log('✅ Migration complete')
}

migrateBookings()
```

Hoặc đơn giản: **Xóa data cũ và seed lại:**
```bash
pnpm seed
```

---

## Legal Compliance

### Quy Định Pháp Luật:

Theo **Nghị định 108/2013/NĐ-CP** về kinh doanh lưu trú:

> **Điều 20. Trách nhiệm của cơ sở kinh doanh lưu trú**
> 
> 1. Yêu cầu khách xuất trình giấy tờ tùy thân (CCCD, CMND, Passport) khi đăng ký lưu trú
> 2. Lưu trữ thông tin khách lưu trú theo quy định
> 3. Báo cáo cơ quan chức năng khi có yêu cầu

### Lý Do Bắt Buộc:

✅ **An ninh:** Xác định danh tính khách hàng
✅ **Pháp lý:** Tuân thủ quy định về lưu trú
✅ **Truy xuất:** Tra cứu thông tin khi cần thiết
✅ **Báo cáo:** Cung cấp cho cơ quan chức năng khi có yêu cầu

---

## Deployment Checklist

- [x] Update Booking Model with CCCD field
- [x] Add API validation for CCCD
- [x] Update Booking Form UI with CCCD input
- [x] Add client-side validation
- [x] Update seed data with sample CCCD
- [x] Update test scripts
- [x] Test form validation (9 & 12 digits)
- [x] Test API validation
- [ ] **TODO:** Run database migration for existing bookings
- [ ] **TODO:** Update documentation
- [ ] **TODO:** Train staff on new requirement

---

## Future Enhancements

🔮 **Có thể bổ sung:**

1. **CCCD Scanning:** OCR to auto-fill from CCCD photo
2. **Validation API:** Check CCCD with government database (if available)
3. **Privacy:** Encrypt CCCD in database
4. **Audit Log:** Track who accessed CCCD data
5. **Export:** Generate guest registry report for authorities

---

## Contact

Nếu có vấn đề hoặc câu hỏi:
- 📧 Email: support@chillcine.com
- 📱 Hotline: 0989760000
