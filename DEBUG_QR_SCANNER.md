# 🐛 Debug QR Scanner - Hướng dẫn xử lý lỗi "QR đọc không được"

## 📍 Vấn đề: Không đọc được QR code từ ảnh CCCD

### 🔧 Cải tiến đã thực hiện

#### 1. **Cải thiện thuật toán scan QR** (`lib/cccd-scanner.ts`)
- ✅ Thử 3 chế độ inversion: `dontInvert`, `onlyInvert`, `attemptBoth`
- ✅ Tự động resize ảnh nếu quá lớn (max 1500px)
- ✅ Thử scan lại với ảnh đã resize
- ✅ Thêm logging chi tiết cho từng bước

#### 2. **Thêm logging debug** (`components/cccd-scanner.tsx`)
- ✅ Log file info (name, type, size)
- ✅ Log từng bước: scan → parse → validate
- ✅ Hiển thị preview QR data khi tìm thấy
- ✅ Log chi tiết validation errors

#### 3. **Tạo Debug Tools**
- ✅ **`/debug/cccd`** - Trang debug chuyên dụng
- ✅ **CCCDScanner tab** - Test upload ảnh thật
- ✅ **Data Tester tab** - Test parse/validate mà không cần ảnh

---

## 🚀 Cách debug

### Bước 1: Chạy dev server
```bash
cd d:\An\booking-app
pnpm dev
```

### Bước 2: Mở trang debug
Truy cập: **http://localhost:3000/debug/cccd**

### Bước 3: Mở Console (F12)
- Click F12 để mở Developer Tools
- Chuyển sang tab **Console**
- Xem logs real-time khi upload ảnh

### Bước 4: Test với ảnh CCCD
1. Chọn tab "QR Scanner"
2. Nhập tên: "Nguyễn Văn A" (hoặc tên trên CCCD của bạn)
3. Click "Chọn ảnh CCCD"
4. Upload ảnh CCCD

### Bước 5: Kiểm tra logs

**Logs mẫu khi thành công:**
```
File selected: { name: "cccd.jpg", type: "image/jpeg", size: 245678 }
Starting QR scan...
Calling scanQRFromImage...
Image size: 1920x1080
Scanning QR code...
QR Code found! 001234567890|Nguyễn Văn A|01011990|Nam|123...
QR scan result: Found (length: 120)
Parsing QR data...
Parsed result: { idNumber: "001234567890", fullName: "Nguyễn Văn A", ... }
Validating CCCD data...
Validation result: { isValid: true, errors: [] }
CCCD scan successful!
```

**Logs khi thất bại:**
```
File selected: { name: "cccd.jpg", type: "image/jpeg", size: 245678 }
Starting QR scan...
Calling scanQRFromImage...
Image size: 1920x1080
Scanning QR code...
First attempt failed, trying with resized image...
QR Code not found after all attempts
QR scan result: Not found
CCCD scan error: Không tìm thấy mã QR trên ảnh CCCD...
```

---

## 🔍 Các nguyên nhân phổ biến

### 1️⃣ Ảnh quá mờ hoặc tối
**Triệu chứng:**
```
QR Code not found after all attempts
```

**Giải pháp:**
- Chụp lại với ánh sáng tốt hơn
- Đảm bảo QR code rõ nét
- Thử tăng độ sáng ảnh trước khi upload

### 2️⃣ Ảnh bị xoay hoặc nghiêng
**Triệu chứng:**
```
QR Code not found after all attempts
```

**Giải pháp:**
- Xoay ảnh cho đúng hướng (QR ở góc dưới bên phải mặt sau CCCD)
- Chụp thẳng, không bị nghiêng

### 3️⃣ QR code bị che hoặc cắt
**Triệu chứng:**
```
QR Code not found after all attempts
```

**Giải pháp:**
- Đảm bảo toàn bộ QR code nằm trong khung hình
- Không để ngón tay, vật cản che QR

### 4️⃣ QR data không đúng format
**Triệu chứng:**
```
Parsing QR data...
Parsed result: null
```

**Giải pháp:**
- Kiểm tra QR data trong log (có thể QR không phải của CCCD)
- Copy QR data vào tab "Data Tester" để test parse

### 5️⃣ Tên không khớp
**Triệu chứng:**
```
Validation result: { 
  isValid: false, 
  errors: ["Tên trên CCCD (X) không khớp với tên đã nhập (Y)"] 
}
```

**Giải pháp:**
- Nhập đúng tên như trên CCCD
- Hệ thống tự động bỏ dấu để so sánh (Nguyễn = Nguyen)

### 6️⃣ Chưa đủ tuổi
**Triệu chứng:**
```
Validation result: { 
  isValid: false, 
  errors: ["Bạn phải từ 18 tuổi trở lên (hiện tại: 16 tuổi)"] 
}
```

**Giải pháp:**
- Dịch vụ chỉ cho người từ 18 tuổi trở lên

---

## 🧪 Test với QR giả (Không có CCCD thật)

### Cách 1: Dùng Data Tester
1. Truy cập: http://localhost:3000/debug/cccd
2. Chọn tab "Data Tester"
3. Nhập QR data (pipe-separated)
4. Click "Test Parse & Validate"

**Format QR CCCD:**
```
Số CCCD|Họ tên|Ngày sinh (DDMMYYYY)|Giới tính|Địa chỉ|Ngày cấp|...
```

**Ví dụ:**
```
001234567890|Nguyễn Văn A|01011990|Nam|123 Đường ABC, Quận 1, TP.HCM|01012021
```

### Cách 2: Tạo QR code giả
1. Truy cập: https://www.qr-code-generator.com/
2. Nhập text theo format trên
3. Download QR code
4. Upload vào QR Scanner tab

---

## 📊 Kiểm tra kỹ thuật

### Check 1: jsQR đã cài đúng chưa?
```bash
pnpm list jsqr
```
Kết quả mong đợi: `jsqr@1.4.0`

### Check 2: Canvas API hoạt động?
Mở Console và chạy:
```javascript
const canvas = document.createElement('canvas')
const ctx = canvas.getContext('2d')
console.log('Canvas supported:', ctx !== null)
```

### Check 3: FileReader hoạt động?
```javascript
const reader = new FileReader()
console.log('FileReader supported:', reader !== null)
```

---

## 🎯 Quick Fixes

### Fix 1: Ảnh quá lớn
Nếu ảnh > 5MB, resize trước khi upload:
```javascript
// Có thể dùng tool online: 
// https://imageresizer.com/
```

### Fix 2: Format ảnh không hỗ trợ
Đảm bảo ảnh là JPG, PNG, WEBP (không phải HEIC, TIFF)

### Fix 3: Browser không hỗ trợ
Test trên Chrome/Edge/Safari mới nhất

---

## 🆘 Nếu vẫn không được

### Gửi thông tin sau cho support:

1. **Console logs** (copy toàn bộ)
2. **Ảnh CCCD** (có thể blur thông tin cá nhân, giữ lại QR)
3. **Browser**: Chrome/Firefox/Safari + version
4. **File info**: 
   - Size: XXX KB
   - Format: JPG/PNG
   - Resolution: XXXxYYY

### Liên hệ:
- Email: support@chillcine.vn
- Hotline: 0989760000
- GitHub Issues: Create new issue

---

## ✅ Checklist debug

- [ ] Đã mở Console (F12)
- [ ] Đã truy cập /debug/cccd
- [ ] Đã nhập đúng tên khách hàng
- [ ] Ảnh CCCD rõ nét, đủ sáng
- [ ] QR code không bị che, cắt
- [ ] Đã check logs trong Console
- [ ] Đã thử test với Data Tester
- [ ] Đã thử với nhiều ảnh khác nhau
- [ ] Đã check browser version

---

**Last Updated:** 29/10/2025  
**Version:** 2.0.0 (với improved QR scanning)
