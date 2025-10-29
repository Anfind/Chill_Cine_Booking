# Hướng dẫn Test Tính năng Quét CCCD

## 🧪 Test Local (Development)

### 1. Khởi động dev server
```bash
cd d:\An\booking-app
pnpm dev
```

### 2. Truy cập trang đặt phòng
1. Mở browser: http://localhost:3000
2. Chọn chi nhánh và phòng
3. Click vào phòng để xem chi tiết
4. Click "Đặt ngay" để vào form booking

### 3. Test flow đầy đủ

**Step 1: Chọn thời gian và dịch vụ**
- Chọn combo package
- Chọn ngày/giờ
- Thêm menu items (tùy chọn)
- Click "Tiếp theo"

**Step 2: Xác thực CCCD**
1. Nhập họ tên: "Nguyễn Văn A"
2. Nhập SĐT: "0987654321"
3. Click "Chọn ảnh CCCD"
4. Upload ảnh CCCD có QR code

**Kết quả mong đợi:**
- ✅ Quét thành công → Hiển thị thông tin CCCD
- ✅ Tên khớp → Cho phép tiếp tục
- ✅ Tuổi >= 18 → Pass validation
- ❌ Tên không khớp → Hiển thị lỗi
- ❌ Tuổi < 18 → Hiển thị lỗi
- ❌ Không tìm thấy QR → Hiển thị lỗi

## 📱 Test trên Mobile

### 1. Build và deploy
```bash
# Build production
pnpm build

# Start production server
pnpm start
```

### 2. Truy cập từ điện thoại
- Kết nối cùng WiFi với máy tính
- Lấy IP máy tính: `ipconfig` (Windows) hoặc `ifconfig` (Mac/Linux)
- Truy cập: http://[IP]:3000

### 3. Test camera capture
- Trên mobile, click "Chọn ảnh CCCD"
- Browser sẽ hỏi quyền camera
- Chụp trực tiếp CCCD
- Kiểm tra kết quả quét

## 🎯 Test Cases

### TC1: Happy Path - CCCD hợp lệ
**Precondition**: Có ảnh CCCD gắn chip, QR code rõ nét
**Steps**:
1. Nhập tên: "Nguyễn Văn A"
2. Upload CCCD của Nguyễn Văn A, tuổi >= 18
**Expected**: Thành công, hiển thị thông tin CCCD

### TC2: Tên không khớp
**Precondition**: Có ảnh CCCD hợp lệ
**Steps**:
1. Nhập tên: "Trần Văn B"
2. Upload CCCD của Nguyễn Văn A
**Expected**: Lỗi "Tên trên CCCD (Nguyễn Văn A) không khớp..."

### TC3: Chưa đủ tuổi
**Precondition**: Có ảnh CCCD của người dưới 18 tuổi
**Steps**:
1. Nhập tên đúng
2. Upload CCCD
**Expected**: Lỗi "Bạn phải từ 18 tuổi trở lên..."

### TC4: QR không rõ
**Precondition**: Ảnh CCCD mờ, QR bị che
**Steps**:
1. Upload ảnh CCCD chất lượng kém
**Expected**: Lỗi "Không tìm thấy mã QR trên ảnh CCCD..."

### TC5: File không hợp lệ
**Steps**:
1. Upload file PDF hoặc Word
**Expected**: Lỗi "Vui lòng chọn file ảnh"

### TC6: Tên có dấu
**Precondition**: CCCD có tên "Nguyễn Văn Á"
**Steps**:
1. Nhập tên: "Nguyen Van A" (không dấu)
2. Upload CCCD
**Expected**: Thành công (hệ thống bỏ dấu để so sánh)

### TC7: Retry sau lỗi
**Steps**:
1. Upload ảnh lỗi → Lỗi hiển thị
2. Click "Thử lại"
3. Upload ảnh đúng
**Expected**: Quay về trạng thái idle, cho phép upload lại

## 🔍 Debug

### Kiểm tra QR data trong console
```typescript
// Thêm vào lib/cccd-scanner.ts
console.log('QR Data:', qrData)
console.log('Parsed Data:', parsedData)
console.log('Validation:', validation)
```

### Kiểm tra file đã upload
```typescript
// Thêm vào handleFileSelect
console.log('File type:', file.type)
console.log('File size:', file.size)
```

### Test với QR giả
Tạo QR code test tại: https://www.qr-code-generator.com/

**Dữ liệu test**:
```
001234567890|Nguyễn Văn A|01011990|Nam|123 Đường ABC, Quận 1, TP.HCM|01012021
```

## 📊 Metrics để theo dõi

- Tỷ lệ quét thành công / thất bại
- Thời gian trung bình để quét QR
- Các lỗi phổ biến (QR không rõ, tên không khớp, etc.)
- Thiết bị nào gặp vấn đề (iOS/Android/Desktop)

## 🐛 Known Issues

1. **Một số browser cũ không hỗ trợ Canvas API**
   - Giải pháp: Khuyến nghị update browser

2. **Camera permission bị từ chối**
   - Giải pháp: Hướng dẫn user cấp quyền trong settings

3. **QR quá nhỏ hoặc quá lớn**
   - Giải pháp: Hướng dẫn chụp ở khoảng cách vừa phải

## 📝 Checklist trước khi merge

- [ ] Code đã build thành công
- [ ] Test happy path thành công
- [ ] Test error cases thành công
- [ ] Test trên mobile (iOS & Android)
- [ ] Test với CCCD thật
- [ ] Documentation đầy đủ
- [ ] Code review
- [ ] Update CHANGELOG.md
- [ ] Thông báo cho team về tính năng mới

---

**Lưu ý quan trọng**: 
- Cần CCCD gắn chip thật để test đầy đủ
- QR code giả chỉ phục vụ mục đích dev, không đảm bảo 100% format đúng
- Nên test trên nhiều loại thiết bị và browser khác nhau
