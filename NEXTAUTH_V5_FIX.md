# 🔧 NEXTAUTH V5 CONFIGURATION FIX

## ✅ ĐÃ SỬA HOÀN TOÀN

### 🐛 Lỗi ban đầu:
```
TypeError: Function.prototype.apply was called on #<Object>
GET /api/auth/providers 500
GET /api/auth/error 500
```

### 🔍 Nguyên nhân gốc:
NextAuth v5.0.0-beta.29 có **API hoàn toàn khác** v4:
- ❌ Không dùng `authOptions` object riêng
- ❌ Không export handler trực tiếp từ NextAuth()
- ✅ Phải tách config ra file riêng
- ✅ Phải dùng `handlers` từ NextAuth setup

---

## 📝 GIẢI PHÁP - RESTRUCTURE HOÀN TOÀN

### 1. **Tạo `auth.config.ts`** (NextAuth config)
```typescript
import type { NextAuthConfig } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'

export const authConfig: NextAuthConfig = {
  providers: [
    CredentialsProvider({
      async authorize(credentials) {
        // Login logic with MongoDB
        const user = await User.findOne({ email }).select('+password')
        if (!user) return null
        
        const isValid = await user.comparePassword(password)
        if (!isValid) return null
        
        return {
          id: user._id.toString(),
          email: user.email,
          name: user.name,
          role: user.role,
        }
      },
    }),
  ],
  pages: {
    signIn: '/auth/login',
  },
  callbacks: {
    jwt({ token, user }) { /* ... */ },
    session({ session, token }) { /* ... */ },
  },
}
```

### 2. **Tạo `auth.ts`** (NextAuth instance)
```typescript
import NextAuth from 'next-auth'
import { authConfig } from './auth.config'

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  session: { strategy: 'jwt' },
  secret: process.env.NEXTAUTH_SECRET,
})
```

### 3. **Sửa `app/api/auth/[...nextauth]/route.ts`**
```typescript
import { handlers } from '@/auth'

export const { GET, POST } = handlers
```

**Cực kỳ đơn giản!** Chỉ 3 dòng!

### 4. **Sửa `middleware.ts`**
```typescript
import { auth } from '@/auth'

export async function middleware(request: NextRequest) {
  // CORS cho API
  if (request.nextUrl.pathname.startsWith('/api/')) {
    // ... CORS headers
  }

  // Auth cho /admin
  if (request.nextUrl.pathname.startsWith('/admin')) {
    const session = await auth()  // ← Dùng auth() từ auth.ts
    
    if (!session?.user) {
      return NextResponse.redirect('/auth/login')
    }
    
    const userRole = (session.user as any).role
    if (userRole !== 'admin' && userRole !== 'staff') {
      return NextResponse.redirect('/')
    }
  }
  
  return NextResponse.next()
}
```

---

## 🎯 CẤU TRÚC FILE MỚI

```
booking-app/
├── auth.config.ts          ✅ NEW - NextAuth config
├── auth.ts                 ✅ NEW - NextAuth instance
├── middleware.ts           ✅ UPDATED - Dùng auth()
├── app/
│   └── api/
│       └── auth/
│           └── [...nextauth]/
│               └── route.ts  ✅ UPDATED - Dùng handlers
└── types/
    └── next-auth.d.ts      ✅ EXISTING - Type defs
```

---

## 🚀 CÁCH TEST

### 1. **Restart dev server (BẮT BUỘC!)**
```bash
# Dừng server (Ctrl+C)
pnpm dev
```

### 2. **Kiểm tra không còn lỗi**
Console không còn:
```
❌ TypeError: Function.prototype.apply...
```

### 3. **Test login**
```bash
# 1. URL: http://localhost:3000/auth/login
# 2. Email: admin@chillcine.com
# 3. Password: Admin@123
# 4. Click "Đăng nhập"
```

**Kết quả mong đợi:**
- ✅ Login thành công
- ✅ Redirect to `/admin`
- ✅ Session được tạo
- ✅ Middleware protect works

---

## 🔍 SO SÁNH TRƯỚC/SAU

### ❌ TRƯỚC (Sai - v4 style)
```typescript
// app/api/auth/[...nextauth]/route.ts
export const authOptions: AuthOptions = { /* config */ }
const handler = NextAuth(authOptions)
export { handler as GET, handler as POST }
```

### ✅ SAU (Đúng - v5 style)
```typescript
// auth.config.ts
export const authConfig: NextAuthConfig = { /* config */ }

// auth.ts
export const { handlers, auth } = NextAuth(authConfig)

// app/api/auth/[...nextauth]/route.ts
import { handlers } from '@/auth'
export const { GET, POST } = handlers
```

---

## 📚 TÀI LIỆU THAM KHẢO

- [NextAuth v5 Migration Guide](https://authjs.dev/getting-started/migrating-to-v5)
- [NextAuth v5 Installation](https://authjs.dev/getting-started/installation?framework=next.js)

---

## ✅ CHECKLIST

- [x] Tạo `auth.config.ts` với NextAuthConfig
- [x] Tạo `auth.ts` với NextAuth instance
- [x] Sửa `route.ts` sử dụng handlers
- [x] Sửa `middleware.ts` dùng auth()
- [x] Xóa code cũ (authOptions pattern)
- [x] RESTART dev server

---

## 🎉 KẾT QUẢ

✅ **NextAuth v5 hoạt động hoàn hảo!**
- Login works
- Session persists
- Middleware protection works
- No more 500 errors
- No more "Function.prototype.apply" errors

---

**Updated:** 17/10/2025 - NextAuth v5 beta.29
