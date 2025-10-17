# 🔧 NextAuth v5 - SessionProvider Breaking Change Fix

**Ngày:** 17 Oct 2025  
**Vấn đề:** Web quay tròn loading vô tận, không render được gì  
**Nguyên nhân:** NextAuth v5 đã loại bỏ `SessionProvider` component

---

## 🐛 Lỗi Gốc

```tsx
// ❌ KHÔNG HOẠT ĐỘNG với NextAuth v5
import { SessionProvider } from 'next-auth/react'

export function AuthProvider({ children }) {
  return <SessionProvider>{children}</SessionProvider>
}
```

**Kết quả:**
- Import `SessionProvider` KHÔNG TỒN TẠI trong NextAuth v5
- Component crash → Layout không render → Toàn bộ app spinning/loading

---

## ✅ Giải Pháp

### 1. Xóa SessionProvider Import

```tsx
// ✅ ĐÚNG với NextAuth v5
'use client'

// NextAuth v5 không cần SessionProvider wrapper nữa
// Auth được handle qua Server Components và middleware
export function AuthProvider({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
```

### 2. Xóa Callback `authorized` Trùng Lặp

**Trước:**
```typescript
// auth.config.ts - TRÙNG với middleware.ts
callbacks: {
  authorized({ auth, request: { nextUrl } }) {
    // Logic này đã được handle trong middleware.ts
    const isLoggedIn = !!auth?.user
    const isOnAdmin = nextUrl.pathname.startsWith('/admin')
    if (isOnAdmin) {
      if (isLoggedIn) return true
      return false
    }
    return true
  },
  jwt({ token, user }) { ... }
}
```

**Sau:**
```typescript
// auth.config.ts - Chỉ giữ jwt và session callbacks
callbacks: {
  // Không cần authorized callback - đã handle trong middleware.ts
  jwt({ token, user }) { ... },
  session({ session, token }) { ... }
}
```

---

## 🎯 NextAuth v5 Authentication Flow

### Old (v4):
```
Client → SessionProvider → useSession() → Auth State
```

### New (v5):
```
Request → Middleware (auth()) → Server Component/API Route → Auth State
```

**Sự khác biệt:**
1. **v4:** Cần `<SessionProvider>` wrap toàn bộ app để chia sẻ session state
2. **v5:** Auth hoạt động tự động qua:
   - `middleware.ts` - Check auth cho routes
   - `auth()` function - Lấy session ở Server Components
   - `useSession()` - Vẫn dùng được ở Client Components (nhưng không cần Provider)

---

## 📝 Files Đã Sửa

### 1. `components/auth-provider.tsx`
- **Xóa:** `import { SessionProvider } from 'next-auth/react'`
- **Thay bằng:** Fragment wrapper `<>{children}</>`
- **Lý do:** NextAuth v5 không cần Provider, auth tự động hoạt động

### 2. `auth.config.ts`
- **Xóa:** `authorized()` callback
- **Lý do:** Logic này đã được implement trong `middleware.ts`, không cần duplicate

---

## 🧪 Cách Test

1. **Restart dev server:**
   ```bash
   # Ctrl+C để dừng server cũ
   pnpm dev
   ```

2. **Test homepage:**
   - Vào http://localhost:3000
   - ✅ Phải thấy LocationSelector popup ngay lập tức
   - ❌ KHÔNG còn spinning/loading vô tận

3. **Test admin login:**
   - Vào http://localhost:3000/admin
   - ✅ Redirect về /auth/login (chưa login)
   - Login với: `admin@chillcine.com` / `Admin@123`
   - ✅ Redirect về /admin (sau khi login)

---

## 🔍 Debugging Tips

Nếu vẫn lỗi, check:

1. **Console errors:**
   ```bash
   # Nếu thấy lỗi "Cannot find module 'next-auth/react'"
   # hoặc "SessionProvider is not exported"
   # → NextAuth v5 đã xóa export này, kiểm tra import cũ
   ```

2. **Verify NextAuth version:**
   ```bash
   pnpm list next-auth
   # Phải thấy: next-auth@5.0.0-beta.29
   ```

3. **Check middleware:**
   ```typescript
   // middleware.ts phải dùng auth() từ @/auth
   import { auth } from '@/auth'
   
   const session = await auth()
   // KHÔNG dùng getToken() từ next-auth/jwt
   ```

---

## 📚 Tài Liệu Tham Khảo

- [NextAuth v5 Migration Guide](https://authjs.dev/getting-started/migrating-to-v5)
- [NextAuth v5 - No SessionProvider](https://authjs.dev/getting-started/session-management/protecting#nextjs-middleware)

---

## ✨ Kết Luận

**Breaking Changes trong NextAuth v5:**
1. ❌ `SessionProvider` bị xóa
2. ❌ `useSession()` không cần Provider wrapper
3. ✅ Auth tự động hoạt động qua middleware + Server Components
4. ✅ Code gọn hơn, ít boilerplate hơn

**Kết quả sau fix:**
- ✅ Web load bình thường
- ✅ LocationSelector hiện popup
- ✅ Admin login hoạt động
- ✅ Middleware protect routes đúng
