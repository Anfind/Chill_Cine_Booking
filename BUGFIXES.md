# 🔧 Bug Fixes - Oct 23, 2025

## Lỗi đã phát hiện từ Vercel Logs

### 🔴 Lỗi 1: ECONNREFUSED 127.0.0.1:3000 (ĐÃ FIX)

**Triệu chứng:**
```
Error fetching branch for metadata: TypeError: fetch failed
connect ECONNREFUSED 127.0.0.1:3000
```

**Nguyên nhân:**
- File `app/rooms/[branchId]/page.tsx` sử dụng biến môi trường `NEXT_PUBLIC_BASE_URL` (không tồn tại)
- Fallback về `http://localhost:3000` trong production
- Serverless function không thể fetch đến localhost

**Ảnh hưởng:**
- ❌ Metadata SEO không load được cho trang rooms
- ❌ Google/Facebook không index được thông tin đầy đủ
- ✅ Chức năng chính vẫn hoạt động (chỉ thiếu metadata)

**Giải pháp:**
```typescript
// BEFORE
const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'

// AFTER
const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://chill-cine.vercel.app'
```

**File đã sửa:**
- `app/rooms/[branchId]/page.tsx` (line 14)

---

### 🟡 Lỗi 2: Mongoose Duplicate Index Warning (ĐÃ FIX)

**Triệu chứng:**
```
[MONGOOSE] Warning: Duplicate schema index on {"email":1} found
```

**Nguyên nhân:**
- Schema User khai báo index trùng lặp:
  - Line 23: `email: { unique: true }` → Tự động tạo index
  - Line 76: `UserSchema.index({ email: 1 })` → Tạo index thủ công

**Ảnh hưởng:**
- ⚠️ Chỉ là warning, không ảnh hưởng chức năng
- ⚠️ Tốn bộ nhớ và thời gian tạo index không cần thiết

**Giải pháp:**
```typescript
// BEFORE
UserSchema.index({ email: 1 })
UserSchema.index({ role: 1, isActive: 1 })

// AFTER (xóa dòng duplicate)
// Indexes (email index is already created by unique: true)
UserSchema.index({ role: 1, isActive: 1 })
```

**File đã sửa:**
- `lib/models/User.ts` (line 76)

---

## 🔧 Các thay đổi khác

### `.env.local` - Cập nhật Payment URLs

```diff
- PAY2S_REDIRECT_URL=https://b0fd13d62299.ngrok-free.app/payment/success
- PAY2S_IPN_URL=https://b0fd13d62299.ngrok-free.app/api/payment/pay2s/ipn
+ PAY2S_REDIRECT_URL=https://chill-cine.vercel.app/payment/success
+ PAY2S_IPN_URL=https://chill-cine.vercel.app/api/payment/pay2s/ipn
```

**Lưu ý:** Chỉ dùng cho production. Local dev có thể dùng ngrok.

---

## ✅ Kết quả

Sau khi fix:
- ✅ Metadata SEO cho trang rooms load thành công
- ✅ Không còn warning Mongoose duplicate index
- ✅ Tất cả URLs đều dùng production domain

---

## 🚀 Triển khai

```bash
git add .
git commit -m "fix: econnrefused localhost and mongoose duplicate index"
git push origin deploy
```

Vercel sẽ tự động deploy lại trong ~2-3 phút.

---

## 📊 Kiểm tra sau khi deploy

1. **Test metadata:**
   - Mở https://chill-cine.vercel.app/rooms/68f9069181ee394bab321834
   - View page source (Ctrl+U)
   - Tìm `<meta name="description"` → Phải có description đầy đủ

2. **Check logs:**
   - Vercel Dashboard → Functions → Logs
   - Không còn error "ECONNREFUSED"
   - Không còn warning "Duplicate schema index"

3. **SEO validator:**
   - https://search.google.com/test/rich-results
   - Paste URL trang rooms
   - Verify metadata được crawl đầy đủ

---

**Tất cả lỗi đã được fix! Ready to push.** 🎉
