# 🔄 Downgrade NextAuth v5 → v4 Stable

**Ngày:** 17 Oct 2025  
**Lý do:** NextAuth v5 beta có quá nhiều breaking changes, gây lỗi spinning/loading, hydration mismatch  
**Giải pháp:** Downgrade về NextAuth v4.24.11 (stable)

---

## 🚨 Vấn Đề với NextAuth v5 Beta

### Lỗi gặp phải:
1. ❌ Web quay tròn loading vô tận (LocationSelector spinning)
2. ❌ Hydration mismatch warnings
3. ❌ Admin page không load được
4. ❌ SessionProvider không tồn tại trong v5
5. ❌ API routes trả về lỗi 500
6. ❌ Too many breaking changes, docs không đầy đủ

### Quyết định:
✅ **Downgrade về NextAuth v4 stable** - Production-ready, docs đầy đủ, API ổn định

---

## 📦 Changes Made

### 1. Package Update
```bash
pnpm remove next-auth
pnpm add next-auth@^4.24.10
```

**Kết quả:** `next-auth@4.24.11` (latest v4 stable)

### 2. Restored NextAuth v4 Route Handler

**File:** `app/api/auth/[...nextauth]/route.ts`

```typescript
// ✅ NextAuth v4 Pattern
import NextAuth, { AuthOptions } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'

export const authOptions: AuthOptions = {
  providers: [
    CredentialsProvider({
      // ... credentials config
      async authorize(credentials) {
        await connectDB()
        const user = await User.findOne({ email }).select('+password')
        const isValid = await user.comparePassword(password)
        return isValid ? { id, email, name, role } : null
      },
    }),
  ],
  session: { strategy: 'jwt' },
  pages: { signIn: '/auth/login' },
  callbacks: {
    async jwt({ token, user }) { /* ... */ },
    async session({ session, token }) { /* ... */ },
  },
  secret: process.env.NEXTAUTH_SECRET,
}

const handler = NextAuth(authOptions)
export { handler as GET, handler as POST }
```

**Deleted v5 pattern:**
```typescript
// ❌ v5 - Too complex
import { handlers } from '@/auth'
export const { GET, POST } = handlers
```

### 3. Restored Middleware with `getToken()`

**File:** `middleware.ts`

```typescript
// ✅ NextAuth v4
import { getToken } from 'next-auth/jwt'

export async function middleware(request: NextRequest) {
  if (request.nextUrl.pathname.startsWith('/admin')) {
    const token = await getToken({
      req: request,
      secret: process.env.NEXTAUTH_SECRET,
    })
    
    if (!token) {
      return NextResponse.redirect(loginUrl)
    }
    
    const userRole = (token as any).role
    if (userRole !== 'admin' && userRole !== 'staff') {
      return NextResponse.redirect(homeUrl)
    }
  }
}
```

**Deleted v5 pattern:**
```typescript
// ❌ v5
import { auth } from '@/auth'
const session = await auth()
```

### 4. Restored `SessionProvider`

**File:** `components/auth-provider.tsx`

```tsx
// ✅ NextAuth v4 - SessionProvider works!
'use client'

import { SessionProvider } from 'next-auth/react'

export function AuthProvider({ children }: { children: React.ReactNode }) {
  return <SessionProvider>{children}</SessionProvider>
}
```

### 5. Deleted v5-only Files

```bash
del auth.config.ts   # NextAuth v5 config file
del auth.ts          # NextAuth v5 instance file
```

---

## 🐛 Fixed Hydration Mismatch

### Added `DialogDescription` to LocationSelector

**Before:**
```tsx
<DialogTitle>Chọn tỉnh thành</DialogTitle>
{step === "branch" && <p>Chọn chi nhánh</p>}
```

**After:**
```tsx
<DialogTitle>Chọn tỉnh thành</DialogTitle>
<DialogDescription>
  {step === "city" ? "Chọn tỉnh/thành phố để xem các chi nhánh" : "Chọn chi nhánh của bạn"}
</DialogDescription>
```

**Lý do:** Radix Dialog yêu cầu DialogDescription để accessibility

### Added `suppressHydrationWarning` to Layout

**File:** `app/layout.tsx`

```tsx
<html lang="vi" suppressHydrationWarning>
  <body suppressHydrationWarning>
```

**Lý do:** Suppress hydration warnings từ browser extensions (bis_register attribute)

---

## 🎯 NextAuth v4 vs v5 Comparison

| Feature | v4 (Stable) | v5 (Beta) |
|---------|-------------|-----------|
| **API Stability** | ✅ Production-ready | ⚠️ Beta, breaking changes |
| **SessionProvider** | ✅ `<SessionProvider>` | ❌ Removed |
| **Config Pattern** | ✅ `authOptions: AuthOptions` | ❌ Split into auth.config.ts + auth.ts |
| **Middleware** | ✅ `getToken()` | ⚠️ `auth()` function |
| **Route Handler** | ✅ `NextAuth(authOptions)` | ❌ `handlers` export |
| **Documentation** | ✅ Complete | ⚠️ Incomplete |
| **useSession()** | ✅ Works with Provider | ⚠️ No Provider needed |
| **Learning Curve** | ✅ Easy | ⚠️ Steep (new patterns) |

---

## ✅ Files Modified

1. ✅ `package.json` - Downgraded to next-auth@4.24.11
2. ✅ `app/api/auth/[...nextauth]/route.ts` - Restored v4 authOptions pattern
3. ✅ `middleware.ts` - Restored getToken() from next-auth/jwt
4. ✅ `components/auth-provider.tsx` - Restored SessionProvider
5. ✅ `components/location-selector.tsx` - Added DialogDescription
6. ✅ `app/layout.tsx` - Added suppressHydrationWarning
7. ❌ `auth.config.ts` - DELETED (v5 only)
8. ❌ `auth.ts` - DELETED (v5 only)

---

## 🧪 Testing Checklist

### After Restart (`pnpm dev`):

1. **Homepage:**
   - [ ] ✅ Vào http://localhost:3000
   - [ ] ✅ LocationSelector popup hiện ngay (không spinning)
   - [ ] ✅ Chọn tỉnh thành → Hiện danh sách branches
   - [ ] ✅ Không còn hydration warnings

2. **Admin Login:**
   - [ ] ✅ Vào http://localhost:3000/admin
   - [ ] ✅ Redirect về /auth/login
   - [ ] ✅ Login: `admin@chillcine.com` / `Admin@123`
   - [ ] ✅ Redirect về /admin sau khi login thành công

3. **Console:**
   - [ ] ✅ Không còn lỗi "SessionProvider not found"
   - [ ] ✅ Không còn lỗi 500 từ NextAuth
   - [ ] ✅ Không còn "Missing Description" warning

---

## 📝 Environment Variables

Ensure `.env.local` có:

```env
MONGODB_URI=mongodb://localhost:27017/chill-cine-hotel
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=chill-cine-hotel-super-secret-key-2025-production-ready-32-chars-minimum
```

---

## 🎉 Kết Luận

**Quyết định đúng đắn:**
- ✅ NextAuth v4 stable, production-ready
- ✅ API đơn giản, dễ hiểu, docs đầy đủ
- ✅ Không có breaking changes bất ngờ
- ✅ SessionProvider hoạt động tốt
- ✅ Middleware dễ implement với getToken()

**NextAuth v5:**
- ⚠️ Còn beta, nhiều breaking changes
- ⚠️ Docs chưa đầy đủ
- ⚠️ Cần refactor nhiều code
- ⚠️ Nên chờ stable release mới upgrade

**Recommendation:**
Dùng NextAuth v4 cho production. Đợi v5 ra stable (có thể 2026) mới xem xét upgrade.
