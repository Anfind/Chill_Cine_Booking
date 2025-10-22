# 🔐 Admin Dashboard & Authentication System

**Ngày tạo:** 16/10/2025  
**Trạng thái:** 📝 Hướng dẫn Implementation

---

## 📋 Phân tích Dashboard hiện tại

### 1. Cấu trúc Admin Dashboard

```
/app/admin/page.tsx
├── BookingsOverview    (Tổng quan đặt phòng)
├── BranchesManager     (Quản lý chi nhánh)
└── RoomsManager        (Quản lý phòng)
```

### 2. Tính năng hiện có

#### **BookingsOverview** (`components/admin/bookings-overview.tsx`)
- 📊 Thống kê tổng quan:
  - Tổng đặt phòng
  - Doanh thu
  - Khách hàng mới
  - Tỷ lệ lấp đầy
- 📋 Danh sách đặt phòng gần đây
- ⚠️ **Trạng thái**: Mock data (chưa kết nối MongoDB)

#### **BranchesManager** (`components/admin/branches-manager.tsx`)
- ➕ Thêm chi nhánh mới
- ✏️ Sửa thông tin chi nhánh
- 🗑️ Xóa chi nhánh
- 🗺️ Quản lý địa chỉ theo thành phố
- ⚠️ **Trạng thái**: Mock data (chưa kết nối MongoDB)

#### **RoomsManager** (`components/admin/rooms-manager.tsx`)
- ➕ Thêm phòng mới
- ✏️ Sửa thông tin phòng
- 🗑️ Xóa phòng
- 🏢 Filter theo chi nhánh
- ⚠️ **Trạng thái**: Mock data (chưa kết nối MongoDB)

### 3. Vấn đề hiện tại

❌ **Không có hệ thống authentication**
- Bất kỳ ai cũng có thể truy cập `/admin`
- Không có login page
- Không có session management
- Không có role-based access control

❌ **Chưa kết nối MongoDB**
- Tất cả components đều dùng mock data từ `lib/data.ts`
- CRUD operations chỉ cập nhật local state, không lưu vào database
- Refresh page → mất hết thay đổi

---

## 🎯 Giải pháp: Implement Authentication System

Có **3 phương án** để implement authentication:

### Phương án 1: NextAuth.js (Recommended) ⭐

**Ưu điểm:**
- ✅ Popular và well-maintained
- ✅ Tích hợp sẵn với Next.js
- ✅ Hỗ trợ nhiều providers (Google, GitHub, Credentials...)
- ✅ Built-in session management
- ✅ TypeScript support tốt

**Nhược điểm:**
- ⚠️ Configuration hơi phức tạp
- ⚠️ Cần setup JWT secret

### Phương án 2: Simple JWT + MongoDB

**Ưu điểm:**
- ✅ Đơn giản, dễ hiểu
- ✅ Full control
- ✅ Lightweight

**Nhược điểm:**
- ⚠️ Phải tự implement nhiều thứ
- ⚠️ Bảo mật phải tự lo

### Phương án 3: Clerk / Auth0 (SaaS)

**Ưu điểm:**
- ✅ Dễ setup nhất
- ✅ UI/UX đẹp sẵn
- ✅ Bảo mật tốt

**Nhược điểm:**
- ⚠️ Có phí (free tier giới hạn)
- ⚠️ Phụ thuộc third-party

---

## 🚀 Hướng dẫn: Implement NextAuth.js

### Bước 1: Cài đặt packages

```bash
npm install next-auth@latest bcryptjs
npm install -D @types/bcryptjs
```

### Bước 2: Tạo User Model

**File:** `lib/models/User.ts`

```typescript
import mongoose, { Schema, Document } from 'mongoose'
import bcrypt from 'bcryptjs'

export interface IUser extends Document {
  email: string
  password: string
  name: string
  role: 'admin' | 'staff' | 'user'
  isActive: boolean
  createdAt: Date
  updatedAt: Date
  comparePassword(candidatePassword: string): Promise<boolean>
}

const UserSchema = new Schema<IUser>(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: true,
      minlength: 6,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    role: {
      type: String,
      enum: ['admin', 'staff', 'user'],
      default: 'user',
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
)

// Hash password trước khi save
UserSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next()
  
  try {
    const salt = await bcrypt.genSalt(10)
    this.password = await bcrypt.hash(this.password, salt)
    next()
  } catch (error) {
    next(error as Error)
  }
})

// Method để so sánh password
UserSchema.methods.comparePassword = async function (
  candidatePassword: string
): Promise<boolean> {
  return bcrypt.compare(candidatePassword, this.password)
}

export default mongoose.models.User || mongoose.model<IUser>('User', UserSchema)
```

### Bước 3: Update Model Registry

**File:** `lib/models/index.ts`

```typescript
// Existing imports...
import User from './User'

// Export all models
export { City, Branch, RoomType, Room, ComboPackage, MenuItem, Booking, User }
```

### Bước 4: Tạo NextAuth Configuration

**File:** `app/api/auth/[...nextauth]/route.ts`

```typescript
import NextAuth, { NextAuthOptions } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import connectDB from '@/lib/mongodb'
import { User } from '@/lib/models'

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error('Email và password là bắt buộc')
        }

        await connectDB()

        const user = await User.findOne({ 
          email: credentials.email,
          isActive: true 
        })

        if (!user) {
          throw new Error('Email hoặc password không đúng')
        }

        const isPasswordValid = await user.comparePassword(credentials.password)

        if (!isPasswordValid) {
          throw new Error('Email hoặc password không đúng')
        }

        return {
          id: user._id.toString(),
          email: user.email,
          name: user.name,
          role: user.role,
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
        token.role = user.role
      }
      return token
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string
        session.user.role = token.role as string
      }
      return session
    },
  },
  pages: {
    signIn: '/auth/login',
    error: '/auth/error',
  },
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  secret: process.env.NEXTAUTH_SECRET,
}

const handler = NextAuth(authOptions)
export { handler as GET, handler as POST }
```

### Bước 5: Cập nhật TypeScript Types

**File:** `types/next-auth.d.ts`

```typescript
import NextAuth from 'next-auth'

declare module 'next-auth' {
  interface Session {
    user: {
      id: string
      email: string
      name: string
      role: 'admin' | 'staff' | 'user'
    }
  }

  interface User {
    id: string
    email: string
    name: string
    role: 'admin' | 'staff' | 'user'
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id: string
    role: 'admin' | 'staff' | 'user'
  }
}
```

### Bước 6: Tạo Login Page

**File:** `app/auth/login/page.tsx`

```typescript
'use client'

import { useState } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Film, Loader2 } from 'lucide-react'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)

    try {
      const result = await signIn('credentials', {
        email,
        password,
        redirect: false,
      })

      if (result?.error) {
        setError(result.error)
      } else if (result?.ok) {
        router.push('/admin')
        router.refresh()
      }
    } catch (err) {
      setError('Đã có lỗi xảy ra. Vui lòng thử lại.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-pink-50 via-purple-50 to-pink-50 p-4">
      <Card className="w-full max-w-md border-2 border-pink-200">
        <CardHeader className="space-y-1 bg-gradient-to-r from-pink-100 to-purple-100">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Film className="h-8 w-8 text-pink-600" />
            <CardTitle className="text-2xl font-bold text-gray-800">Chill Cine Hotel</CardTitle>
          </div>
          <CardDescription className="text-center text-gray-600">
            Đăng nhập vào hệ thống quản trị
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4 pt-6">
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="admin@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={isLoading}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Mật khẩu</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={isLoading}
              />
            </div>
          </CardContent>
          <CardFooter className="flex flex-col gap-4">
            <Button
              type="submit"
              className="w-full bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Đang đăng nhập...
                </>
              ) : (
                'Đăng nhập'
              )}
            </Button>
            <Button
              type="button"
              variant="outline"
              className="w-full"
              onClick={() => router.push('/')}
              disabled={isLoading}
            >
              Về trang chủ
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}
```

### Bước 7: Bảo vệ Admin Route

**File:** `app/admin/page.tsx` (Update)

```typescript
'use client'

import { useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { Loader2 } from 'lucide-react'
// ... existing imports

export default function AdminPage() {
  const { data: session, status } = useSession()
  const router = useRouter()

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/login')
    }
  }, [status, router])

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Đang tải...</p>
        </div>
      </div>
    )
  }

  if (status === 'unauthenticated') {
    return null
  }

  // Check if user is admin
  if (session?.user?.role !== 'admin' && session?.user?.role !== 'staff') {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Không có quyền truy cập</h1>
          <p className="text-muted-foreground mb-4">Bạn không có quyền truy cập vào trang này.</p>
          <Button onClick={() => router.push('/')}>Về trang chủ</Button>
        </div>
      </div>
    )
  }

  // ... existing admin dashboard code
}
```

### Bước 8: Wrap App với SessionProvider

**File:** `app/layout.tsx` (Update)

```typescript
import { SessionProvider } from '@/components/session-provider'
// ... existing imports

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="vi" suppressHydrationWarning>
      <body className={inter.className}>
        <SessionProvider>
          <ThemeProvider
            attribute="class"
            defaultTheme="light"
            enableSystem
            disableTransitionOnChange
          >
            {children}
            <Toaster />
          </ThemeProvider>
        </SessionProvider>
      </body>
    </html>
  )
}
```

**File:** `components/session-provider.tsx` (New)

```typescript
'use client'

import { SessionProvider as NextAuthSessionProvider } from 'next-auth/react'

export function SessionProvider({ children }: { children: React.ReactNode }) {
  return <NextAuthSessionProvider>{children}</NextAuthSessionProvider>
}
```

### Bước 9: Tạo API để seed admin user

**File:** `lib/scripts/seed-admin.ts`

```typescript
import connectDB from '../mongodb'
import { User } from '../models'

async function seedAdminUser() {
  try {
    await connectDB()

    // Check if admin exists
    const existingAdmin = await User.findOne({ email: 'admin@chillcine.com' })

    if (existingAdmin) {
      console.log('✅ Admin user already exists')
      return
    }

    // Create admin user
    const admin = await User.create({
      email: 'admin@chillcine.com',
      password: 'Admin@123', // Will be hashed by pre-save hook
      name: 'Administrator',
      role: 'admin',
      isActive: true,
    })

    console.log('✅ Admin user created successfully')
    console.log('📧 Email: admin@chillcine.com')
    console.log('🔑 Password: Admin@123')
    console.log('⚠️  Please change password after first login!')

    process.exit(0)
  } catch (error) {
    console.error('❌ Error seeding admin user:', error)
    process.exit(1)
  }
}

seedAdminUser()
```

### Bước 10: Update package.json scripts

```json
{
  "scripts": {
    "build": "next build",
    "dev": "next dev",
    "lint": "eslint .",
    "start": "next start",
    "db:seed": "tsx lib/scripts/seed.ts",
    "db:seed-admin": "tsx lib/scripts/seed-admin.ts"
  }
}
```

---

## 📝 Các bước thực hiện

### 1. Setup Authentication

```bash
# 1. Cài packages
npm install next-auth@latest bcryptjs
npm install -D @types/bcryptjs

# 2. Tạo các files theo hướng dẫn ở trên

# 3. Tạo admin user
npm run db:seed-admin

# 4. Restart dev server
npm run dev
```

### 2. Test Authentication

1. Truy cập: `http://localhost:3000/auth/login`
2. Login với credentials:
   - Email: `admin@chillcine.com`
   - Password: `Admin@123`
3. Sau khi login thành công → redirect đến `/admin`

### 3. Test Protected Route

- Truy cập trực tiếp `/admin` khi chưa login → redirect đến `/auth/login`
- Login thành công → có thể truy cập `/admin`

---

## 🔒 Bảo mật

### 1. Environment Variables cần thiết

Update `.env`:

```env
# NextAuth Secret (generate bằng: openssl rand -base64 32)
NEXTAUTH_SECRET=your-super-secret-key-change-this-in-production
NEXTAUTH_URL=http://localhost:3000
```

### 2. Password Policy

- Minimum 6 characters
- Hash với bcrypt (salt rounds: 10)
- Không lưu plain text password

### 3. Session Management

- JWT strategy
- Session expires sau 30 ngày
- Auto refresh token

---

## 🎯 Next Steps

### 1. Migrate Admin Components to MongoDB (Priority)

❌ Current: Mock data  
✅ Target: Real MongoDB CRUD

**Files cần sửa:**
- `components/admin/bookings-overview.tsx` → Fetch từ `/api/bookings`
- `components/admin/branches-manager.tsx` → CRUD với `/api/branches`
- `components/admin/rooms-manager.tsx` → CRUD với `/api/rooms`

### 2. Add User Management

- Tạo page quản lý users
- CRUD operations cho users
- Change password functionality
- Role management

### 3. Add Audit Log

- Track user actions
- Log model: userId, action, resource, timestamp
- Display audit trail in admin

### 4. Add Dashboard Charts

- Booking statistics với Chart.js / Recharts
- Revenue charts
- Occupancy rate charts

---

## ✨ Tóm tắt

**Hiện tại:**
- ❌ Không có authentication
- ❌ Admin components dùng mock data
- ❌ Không có access control

**Sau khi implement:**
- ✅ NextAuth.js authentication
- ✅ Protected admin routes
- ✅ Role-based access control (admin, staff, user)
- ✅ Secure password hashing
- ✅ Session management

**Bước tiếp theo:**
1. Implement authentication theo hướng dẫn trên
2. Migrate admin components sang MongoDB
3. Add user management features
4. Add audit logging
