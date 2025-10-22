# 🌐 Hướng dẫn sử dụng Ngrok với Booking App

## 📋 Vấn đề gặp phải

Khi dùng ngrok để expose localhost, có 2 vấn đề chính:

1. **CORS Error**: API calls từ ngrok domain bị chặn
2. **Hardcoded URLs**: API calls gọi đến localhost thay vì ngrok domain

## ✅ Giải pháp đã áp dụng

### 1. Sửa API Client (lib/api-client.ts)
- Dùng **relative URLs** thay vì absolute URLs
- Client-side (browser): API_BASE_URL = '' (empty string)
- Server-side: API_BASE_URL = 'http://localhost:3000'

**Kết quả**: API calls từ ngrok sẽ tự động gọi đến ngrok domain, không còn CORS issue.

### 2. Thêm CORS Headers (middleware.ts)
- Tạo middleware để handle CORS cho tất cả API routes
- Cho phép tất cả origins (`Access-Control-Allow-Origin: *`)
- Handle preflight requests (OPTIONS)

### 3. Cấu hình Next.js (next.config.mjs)
- Thêm CORS headers vào config
- Cho phép external domains (ngrok, production)

---

## 🚀 Cách sử dụng

### Bước 1: Cài đặt ngrok
```bash
# Download và cài đặt ngrok từ https://ngrok.com/download
# Hoặc dùng chocolatey (Windows)
choco install ngrok
```

### Bước 2: Chạy dev server
```bash
# Terminal 1: Chạy Next.js dev server
npm run dev
```

### Bước 3: Chạy ngrok
```bash
# Terminal 2: Expose port 3000
ngrok http 3000
```

### Bước 4: Truy cập
Ngrok sẽ cung cấp URL dạng:
```
https://5a129761210b.ngrok-free.app
```

Mở URL này trên browser, app sẽ hoạt động bình thường!

---

## 🔧 Các file đã sửa

1. ✅ `lib/api-client.ts` - Dùng relative URLs
2. ✅ `middleware.ts` - Thêm CORS headers
3. ✅ `next.config.mjs` - Cấu hình CORS

---

## 📝 Lưu ý quan trọng

### 1. MongoDB Connection
MongoDB đang chạy trên localhost, ngrok chỉ expose web server (port 3000).
- ✅ Web app: Truy cập qua ngrok
- ✅ API routes: Hoạt động bình thường
- ✅ MongoDB: Vẫn kết nối localhost (không cần expose)

### 2. Favicon 404
Lỗi `favicon.ico 404` là bình thường, không ảnh hưởng app. Có thể fix bằng cách:
```bash
# Tạo favicon.ico trong thư mục public/
```

### 3. Ngrok Free Tier
- URL thay đổi mỗi lần khởi động
- Có banner "Visit site" khi truy cập lần đầu
- Giới hạn số requests

Upgrade lên paid plan để có:
- Fixed domain
- Không có banner
- Unlimited requests

---

## 🧪 Test

### 1. Truy cập homepage
```
https://your-ngrok-url.ngrok-free.app
```

Nên thấy:
- ✅ Homepage load thành công
- ✅ API call `/api/cities` thành công
- ✅ Không có CORS errors
- ✅ Data hiển thị bình thường

### 2. Test API trực tiếp
```
https://your-ngrok-url.ngrok-free.app/api/cities
```

Nên trả về:
```json
{
  "success": true,
  "data": [...]
}
```

---

## 🐛 Troubleshooting

### Vẫn còn CORS error?

1. **Kiểm tra middleware.ts tồn tại** ở root folder
2. **Restart dev server**:
   ```bash
   # Stop và start lại
   npm run dev
   ```
3. **Clear browser cache** và reload

### API calls vẫn gọi localhost?

1. **Kiểm tra lib/api-client.ts**:
   ```typescript
   const API_BASE_URL = typeof window !== 'undefined' ? '' : 'http://localhost:3000'
   ```
2. **Kiểm tra browser console**: URL nên là relative `/api/cities`, không phải `http://localhost:3000/api/cities`

### MongoDB connection error?

MongoDB không cần expose qua ngrok:
- Dev server (localhost:3000) kết nối đến MongoDB (localhost:27017) ✅
- Ngrok chỉ expose web server, không expose MongoDB ✅
- Client browser → Ngrok → Dev server → MongoDB ✅

---

## 📚 Tài liệu tham khảo

- [Ngrok Documentation](https://ngrok.com/docs)
- [Next.js CORS Configuration](https://nextjs.org/docs/app/api-reference/next-config-js/headers)
- [Next.js Middleware](https://nextjs.org/docs/app/building-your-application/routing/middleware)

---

## ✨ Tóm tắt

**Vấn đề**: CORS error khi dùng ngrok  
**Nguyên nhân**: API calls dùng absolute URLs (localhost)  
**Giải pháp**: Dùng relative URLs + CORS headers  
**Kết quả**: App hoạt động bình thường qua ngrok ✅
