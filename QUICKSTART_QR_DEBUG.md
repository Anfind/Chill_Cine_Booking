# 🚀 Quick Start - Test QR Scanner

## Chạy ngay (3 bước)

```bash
# 1. Start dev server
pnpm dev

# 2. Mở browser
http://localhost:3000/debug/cccd

# 3. Mở Console (F12) và upload ảnh CCCD
```

---

## 📍 URLs quan trọng

| Trang | URL | Mục đích |
|-------|-----|----------|
| **Debug Tool** | `/debug/cccd` | Test QR scanner + Data tester |
| **Form Booking** | `/booking/[roomId]` | Form thực tế có QR scanner |
| **Home** | `/` | Chọn chi nhánh và phòng |

---

## 🔑 Console Commands

### Kiểm tra nhanh
```javascript
// Check jsQR loaded
console.log('jsQR:', typeof jsQR !== 'undefined')

// Check Canvas support
console.log('Canvas:', !!document.createElement('canvas').getContext('2d'))

// Check FileReader support
console.log('FileReader:', typeof FileReader !== 'undefined')
```

---

## 🧪 Test Cases

### Test 1: Valid CCCD (18+, tên khớp)
**QR Data:**
```
001234567890|Nguyễn Văn A|01011990|Nam|123 Đường ABC|01012021
```
**Tên nhập:** Nguyễn Văn A  
**Kết quả:** ✅ Thành công

### Test 2: Tên không khớp
**QR Data:**
```
001234567890|Trần Thị B|01011990|Nữ|456 Đường XYZ|01012021
```
**Tên nhập:** Nguyễn Văn A  
**Kết quả:** ❌ Lỗi "Tên không khớp"

### Test 3: Chưa đủ 18 tuổi
**QR Data:**
```
001234567890|Nguyễn Văn C|01012010|Nam|789 Đường DEF|01012021
```
**Tên nhập:** Nguyễn Văn C  
**Kết quả:** ❌ Lỗi "Chưa đủ tuổi"

---

## 📝 Logs mẫu

### ✅ Thành công
```
Starting QR scan...
Image size: 1920x1080
QR Code found! 001234567890|...
Validation result: { isValid: true }
CCCD scan successful!
```

### ❌ Không tìm thấy QR
```
Starting QR scan...
Image size: 1920x1080
First attempt failed, trying with resized...
QR Code not found after all attempts
```

### ❌ QR không đúng format
```
QR Code found! ABCDEFG...
Parsing QR data...
Parsed result: null
```

---

## 🔧 Files quan trọng

| File | Chức năng |
|------|-----------|
| `lib/cccd-scanner.ts` | Logic scan + parse + validate |
| `components/cccd-scanner.tsx` | UI component |
| `components/cccd-tester.tsx` | Test tool |
| `app/debug/cccd/page.tsx` | Debug page |
| `components/booking-form-v2.tsx` | Form tích hợp scanner |

---

## ⚡ Troubleshooting 1-Minute

**Không đọc được QR?**
1. ✓ Ảnh có rõ nét không?
2. ✓ QR có bị che/cắt không?
3. ✓ Console có log gì không?
4. ✓ Thử với ảnh khác?
5. ✓ Test với Data Tester tab?

**Validation fail?**
1. ✓ Tên nhập có đúng không?
2. ✓ Tuổi có >= 18 không?
3. ✓ Check Validation result trong log

**Build fail?**
```bash
# Clean và build lại
rm -rf .next node_modules/.cache
pnpm build
```

---

## 📞 Support

- **📖 Full Guide:** `DEBUG_QR_SCANNER.md`
- **📚 Documentation:** `CCCD_SCANNER_README.md`
- **🧪 Testing Guide:** `TESTING_CCCD_SCANNER.md`
- **☎️ Hotline:** 0989760000

---

**TIP:** Mở Console (F12) trước khi upload ảnh để xem logs real-time! 🎯
