# Tính năng Quét và Xác thực CCCD

## 📋 Tổng quan

Tính năng quét mã QR trên CCCD (Căn cước công dân) gắn chip để tự động xác thực danh tính khách hàng khi đặt phòng.

## 🎯 Mục đích

- **Bảo mật**: Ngăn chặn đặt phòng bằng thông tin giả mạo
- **Tuân thủ pháp luật**: Đáp ứng quy định về lưu trú tại Việt Nam
- **Xác thực tuổi**: Đảm bảo khách hàng từ 18 tuổi trở lên
- **Tự động hóa**: Giảm thiểu nhập liệu thủ công, tăng tốc độ đặt phòng

## 🔧 Công nghệ sử dụng

### Thư viện
- **jsQR**: Quét mã QR từ ảnh
- **Canvas API**: Xử lý ảnh và trích xuất dữ liệu QR

### Components mới
1. **`lib/cccd-scanner.ts`**: Utilities xử lý QR CCCD
   - `scanQRFromImage()`: Quét mã QR từ file ảnh
   - `parseCCCDQRData()`: Parse dữ liệu từ QR code
   - `validateCCCDData()`: Xác thực thông tin CCCD
   - `calculateAge()`: Tính tuổi từ ngày sinh
   - `compareVietnameseNames()`: So sánh tên tiếng Việt (bỏ dấu)

2. **`components/cccd-scanner.tsx`**: React component UI
   - Upload/chụp ảnh CCCD
   - Hiển thị trạng thái quét (scanning, success, error)
   - Preview ảnh CCCD
   - Hiển thị thông tin đã trích xuất

## 📱 Cách sử dụng

### Cho người dùng cuối

1. **Bước 1**: Điền thông tin cá nhân (Họ tên, SĐT)
2. **Bước 2**: Quét CCCD
   - Click nút "Chọn ảnh CCCD"
   - Chụp hoặc chọn ảnh CCCD từ thư viện
   - Đảm bảo mã QR rõ nét và đầy đủ
3. **Bước 3**: Hệ thống tự động:
   - Quét mã QR
   - Trích xuất thông tin (Số CCCD, Họ tên, Ngày sinh, Giới tính)
   - Xác thực tên khớp với thông tin đã nhập
   - Kiểm tra tuổi >= 18
4. **Kết quả**:
   - ✅ **Thành công**: Hiển thị thông tin và cho phép tiếp tục
   - ❌ **Thất bại**: Hiển thị lỗi và cho phép thử lại

### Yêu cầu CCCD

- ✅ CCCD gắn chip (từ 2021) có mã QR ở mặt sau
- ✅ Ảnh rõ nét, không bị mờ hoặc lóe
- ✅ Mã QR đầy đủ, không bị che hoặc cắt
- ❌ CMND cũ không có QR code (không hỗ trợ)

## 🔍 Định dạng QR CCCD

Mã QR trên CCCD Việt Nam theo Thông tư 07/2016/TT-BCA có cấu trúc:

```
Số CCCD|Họ tên|Ngày sinh|Giới tính|Địa chỉ|Ngày cấp|Ngày hết hạn|Quốc tịch|Dân tộc|Tôn giáo|Đặc điểm nhận dạng
```

**Ví dụ**:
```
001234567890|Nguyễn Văn A|01011990|Nam|123 Đường ABC, Quận 1, TP.HCM|01012021|01012031|Việt Nam|Kinh||
```

**Các trường bắt buộc** (5 trường đầu):
1. Số CCCD (12 số)
2. Họ và tên
3. Ngày sinh (DDMMYYYY)
4. Giới tính
5. Địa chỉ

## 🛠️ Tích hợp vào dự án

### 1. Cài đặt dependencies
```bash
pnpm add jsqr
```

### 2. Import component
```tsx
import { CCCDScanner } from '@/components/cccd-scanner'
import type { CCCDData } from '@/lib/cccd-scanner'
```

### 3. Sử dụng trong form
```tsx
const [cccdData, setCccdData] = useState<CCCDData | null>(null)
const [isCCCDVerified, setIsCCCDVerified] = useState(false)

<CCCDScanner
  customerName={customerName}
  minAge={18}
  onScanSuccess={(data) => {
    setCccdData(data)
    setIsCCCDVerified(true)
    toast.success('Xác thực CCCD thành công!')
  }}
  onScanError={(error) => {
    setIsCCCDVerified(false)
    toast.error(error)
  }}
/>
```

### 4. Validation
```tsx
const validateStep2 = () => {
  // ... other validations

  if (!isCCCDVerified || !cccdData) {
    toast.error('Vui lòng quét và xác thực CCCD')
    return false
  }

  return true
}
```

## 🧪 Xử lý lỗi

### Các trường hợp lỗi phổ biến

1. **Không tìm thấy mã QR**
   - Lỗi: "Không tìm thấy mã QR trên ảnh CCCD"
   - Giải pháp: Chụp lại với ánh sáng tốt hơn, đảm bảo QR rõ nét

2. **Tên không khớp**
   - Lỗi: "Tên trên CCCD (X) không khớp với tên đã nhập (Y)"
   - Giải pháp: Kiểm tra lại tên đã nhập, đảm bảo đúng với CCCD

3. **Chưa đủ tuổi**
   - Lỗi: "Bạn phải từ 18 tuổi trở lên (hiện tại: X tuổi)"
   - Giải pháp: Dịch vụ không hỗ trợ người dưới 18 tuổi

4. **Ảnh không hợp lệ**
   - Lỗi: "Vui lòng chọn file ảnh"
   - Giải pháp: Chỉ chấp nhận file ảnh (JPG, PNG, etc.)

5. **Không đọc được dữ liệu**
   - Lỗi: "Không thể đọc dữ liệu từ mã QR"
   - Giải pháp: CCCD có thể bị hỏng hoặc mã QR không chuẩn

## 📊 Dữ liệu trích xuất

```typescript
interface CCCDData {
  idNumber: string              // Số CCCD (12 số)
  fullName: string              // Họ và tên đầy đủ
  dateOfBirth: string           // Ngày sinh (DDMMYYYY)
  gender: string                // Giới tính
  address: string               // Địa chỉ
  issueDate?: string            // Ngày cấp (optional)
  expiryDate?: string           // Ngày hết hạn (optional)
  nationality?: string          // Quốc tịch (optional)
  ethnicity?: string            // Dân tộc (optional)
  religion?: string             // Tôn giáo (optional)
  personalIdentification?: string // Đặc điểm nhận dạng (optional)
  raw: string                   // Dữ liệu QR gốc
}
```

## 🔐 Bảo mật & Quyền riêng tư

### Xử lý dữ liệu
- ✅ Dữ liệu CCCD chỉ được xử lý trên client (browser)
- ✅ Không lưu trữ ảnh CCCD trên server (trừ khi cần audit)
- ✅ Chỉ gửi số CCCD lên server, không gửi thông tin chi tiết khác
- ✅ Tuân thủ GDPR và luật bảo vệ dữ liệu cá nhân Việt Nam

### Khuyến nghị
- Nên thêm mã hóa khi truyền dữ liệu CCCD
- Có thể lưu trữ ảnh CCCD để audit (với sự đồng ý của khách hàng)
- Cần có chính sách xóa dữ liệu sau thời gian nhất định

## 🚀 Cải tiến trong tương lai

- [ ] Thêm OCR để đọc thông tin từ ảnh CCCD không có QR (CMND cũ)
- [ ] Hỗ trợ chụp ảnh trực tiếp từ camera (không qua file picker)
- [ ] Lưu trữ ảnh CCCD cho mục đích audit
- [ ] Tích hợp với API xác thực CCCD của Bộ Công An (nếu có)
- [ ] Hỗ trợ passport cho khách nước ngoài

## 📝 Test cases

### Test thủ công

1. **Happy path**: 
   - Upload CCCD hợp lệ → Thành công
   
2. **Tên không khớp**:
   - Nhập tên "Nguyễn Văn A"
   - Upload CCCD của "Trần Thị B"
   - Kỳ vọng: Lỗi tên không khớp

3. **Chưa đủ tuổi**:
   - Upload CCCD của người dưới 18 tuổi
   - Kỳ vọng: Lỗi chưa đủ tuổi

4. **QR không rõ**:
   - Upload ảnh mờ, QR bị che
   - Kỳ vọng: Lỗi không tìm thấy QR

5. **File không phải ảnh**:
   - Upload file PDF, Word
   - Kỳ vọng: Lỗi định dạng file

## 🤝 Đóng góp

Nếu bạn muốn cải thiện tính năng này:
1. Tạo issue trên GitHub
2. Fork repository
3. Tạo branch mới: `git checkout -b feat/scanQR-improvements`
4. Commit changes: `git commit -m 'feat: improve CCCD scanner accuracy'`
5. Push branch: `git push origin feat/scanQR-improvements`
6. Tạo Pull Request

## 📞 Liên hệ & Hỗ trợ

Nếu gặp vấn đề khi sử dụng tính năng này:
- Email: support@chillcine.vn
- Hotline: 0989760000
- GitHub Issues: [Link to repository]

---

**Phiên bản**: 1.0.0  
**Ngày tạo**: 29/10/2025  
**Người tạo**: AI Assistant  
**Branch**: feat/scanQR
