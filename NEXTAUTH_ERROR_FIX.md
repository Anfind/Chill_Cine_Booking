# 🔧 NEXTAUTH ERROR FIX

## Lỗi gặp phải
```
TypeError: Function.prototype.apply was called on #<Object>, which is an object and not a function
GET /api/auth/error 500
```

## Nguyên nhân
- NextAuth v5 beta có cú pháp khác v4
- Không nên throw Error trong authorize(), chỉ return null
- Cần NEXTAUTH_SECRET mạnh hơn

## Giải pháp

### 1. Sửa `app/api/auth/[...nextauth]/route.ts`
```typescript
// ❌ TRƯỚC (throw Error)
if (!user) {
  throw new Error('Email hoặc password không đúng')
}

// ✅ SAU (return null)
if (!user) {
  return null
}
```

### 2. Update `.env.local`
```env
# Thay secret yếu
NEXTAUTH_SECRET=chill-cine-hotel-super-secret-key-2025-production-ready-32-chars-minimum
```

### 3. Type definitions đã có sẵn
File `types/next-auth.d.ts` đã định nghĩa User, Session, JWT types đúng.

## Cách test

### 1. Restart dev server
```bash
# Dừng server (Ctrl+C)
pnpm dev
```

### 2. Seed database (nếu chưa)
```bash
pnpm db:seed
```

### 3. Test login
1. Vào: http://localhost:3000/auth/login
2. Nhập:
   - Email: `admin@chillcine.com`
   - Password: `Admin@123`
3. Kết quả: Đăng nhập thành công → redirect to `/admin`

## Mongoose Index Warnings
Warnings về duplicate indexes không ảnh hưởng app, nhưng có thể fix:

```typescript
// Trong các model files (City.ts, Branch.ts, etc.)
// Xóa index: true trong field definitions NẾU đã có schema.index()

// ❌ Duplicate
code: {
  type: String,
  unique: true,  // <- Xóa dòng này
  index: true,   // <- Hoặc dòng này
}
CitySchema.index({ code: 1 })  // <- Chỉ giữ 1 trong 2

// ✅ Chỉ dùng 1 cách
code: {
  type: String,
  unique: true,
}
// HOẶC
code: {
  type: String,
}
CitySchema.index({ code: 1 }, { unique: true })
```

Nhưng warnings này không gây lỗi, chỉ là thông báo!

## Kết quả
✅ Login hoạt động bình thường
✅ Session được tạo đúng
✅ Redirect to admin dashboard
✅ Middleware auth works

---

**Updated:** 17/10/2025
