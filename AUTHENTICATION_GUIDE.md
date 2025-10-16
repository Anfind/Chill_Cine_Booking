# 🔐 Authentication System - Complete Guide

## Overview
Hệ thống xác thực NextAuth.js với Credentials provider, bảo vệ admin routes và role-based access control.

---

## ✅ What's Implemented

### 1. **User Model** (`lib/models/User.ts`)
```typescript
interface IUser {
  email: string       // Unique, required
  password: string    // Bcrypt hashed
  name: string        // Display name
  role: 'admin' | 'staff' | 'customer'
  createdAt: Date
  updatedAt: Date
}
```

**Features:**
- ✅ Bcrypt password hashing (pre-save hook)
- ✅ Password comparison method
- ✅ Email uniqueness validation
- ✅ TypeScript interfaces

---

### 2. **NextAuth Configuration** (`app/api/auth/[...nextauth]/route.ts`)

**Providers:**
- Credentials (email + password)

**Session Strategy:**
- JWT (token-based)
- 30 days max age

**Callbacks:**
- JWT: Add user id + role to token
- Session: Expose user id + role to client

**Pages:**
- Sign In: `/auth/login`
- Error: `/auth/login`

---

### 3. **Login Page** (`app/auth/login/page.tsx`)

**Features:**
- ✅ Email/password form with validation
- ✅ Error handling & display
- ✅ Loading states with spinner
- ✅ Redirect to callbackUrl after login
- ✅ Beautiful gradient UI with shadcn/ui
- ✅ Test account credentials displayed

**Test Account:**
```
Email: admin@chillcine.com
Password: Admin@123
```

---

### 4. **Middleware Protection** (`middleware.ts`)

**Protected Routes:**
- `/admin/*` - Requires authentication
- Only `admin` and `staff` roles can access

**Behavior:**
- Unauthenticated → Redirect to `/auth/login?callbackUrl=/admin`
- Wrong role → Redirect to `/`
- API routes → CORS headers (unchanged)

---

### 5. **Admin Dashboard** (`app/admin/page.tsx`)

**New Features:**
- ✅ User avatar + name + role display
- ✅ Logout button (redirects to `/auth/login`)
- ✅ 🔐 Protected badge
- ✅ useSession() hook integration
- ✅ Responsive UI

---

### 6. **Session Provider** (`components/auth-provider.tsx`)

Wraps entire app in `app/layout.tsx`:
```tsx
<AuthProvider>
  {children}
</AuthProvider>
```

Enables `useSession()` hook throughout app.

---

## 🚀 Usage

### **1. Start Development Server**
```bash
pnpm dev
```

### **2. Seed Admin User** (if not done)
```bash
pnpm db:seed-admin
```

### **3. Test Authentication Flow**

#### **A. Visit Protected Route (Unauthenticated)**
1. Go to: `http://localhost:3000/admin`
2. **Expected:** Redirect to `/auth/login?callbackUrl=/admin`

#### **B. Login**
1. Enter credentials:
   - Email: `admin@chillcine.com`
   - Password: `Admin@123`
2. Click "Đăng nhập"
3. **Expected:** Redirect to `/admin` dashboard

#### **C. Access Admin Dashboard**
1. Should see:
   - User avatar with "A"
   - Name: "Admin"
   - Role: "admin"
   - 4 tabs: Overview, Bookings, Branches, Rooms
   - Logout button

#### **D. Logout**
1. Click "Đăng xuất"
2. **Expected:** Redirect to `/auth/login`
3. Try accessing `/admin` again → Should redirect to login

---

## 📂 File Structure

```
app/
  api/
    auth/
      [...nextauth]/
        route.ts           # NextAuth config
  auth/
    login/
      page.tsx             # Login page
  admin/
    page.tsx               # Protected admin dashboard

components/
  auth-provider.tsx        # SessionProvider wrapper

lib/
  models/
    User.ts                # User model with bcrypt
    index.ts               # Model registry (exports User)
  scripts/
    seed-admin.ts          # Admin user seeding

middleware.ts              # Route protection
types/
  next-auth.d.ts           # NextAuth type definitions
```

---

## 🔑 Environment Variables

**Required in `.env.local`:**
```bash
# NextAuth Configuration
NEXTAUTH_SECRET=chill-cine-hotel-secret-key-2024-production-ready-auth
NEXTAUTH_URL=http://localhost:3000
```

**Production:**
```bash
# Generate secure secret
openssl rand -base64 32

# Update .env.local
NEXTAUTH_SECRET=<generated-secret>
NEXTAUTH_URL=https://yourdomain.com
```

---

## 🧪 Testing Checklist

- [ ] **Middleware Protection**
  - [ ] `/admin` redirects to `/auth/login` when not logged in
  - [ ] Callback URL preserved: `/auth/login?callbackUrl=/admin`
  
- [ ] **Login Flow**
  - [ ] Correct credentials → Redirect to `/admin`
  - [ ] Wrong credentials → Error message: "Email hoặc password không đúng"
  - [ ] Empty fields → HTML5 validation

- [ ] **Admin Dashboard**
  - [ ] User info displayed (avatar, name, role)
  - [ ] All 4 tabs accessible
  - [ ] Stats load correctly
  - [ ] Bookings table shows data

- [ ] **Logout Flow**
  - [ ] Click logout → Redirect to `/auth/login`
  - [ ] Session cleared
  - [ ] Cannot access `/admin` without re-login

- [ ] **Role-Based Access**
  - [ ] Admin role → Access granted
  - [ ] Staff role → Access granted (when implemented)
  - [ ] Customer role → Redirect to `/`

---

## 🔒 Security Features

✅ **Password Hashing**
- Bcrypt with salt rounds = 10
- Passwords never stored in plain text

✅ **JWT Tokens**
- Signed with NEXTAUTH_SECRET
- 30-day expiration
- HttpOnly cookies (automatic by NextAuth)

✅ **Route Protection**
- Server-side middleware
- Token validation before page load
- Role-based authorization

✅ **CSRF Protection**
- Built-in NextAuth CSRF tokens
- Automatic form protection

---

## 📊 User Roles

| Role | Access Level | Routes |
|------|-------------|--------|
| `admin` | Full access | `/admin/*` |
| `staff` | Management access | `/admin/*` (future: limited features) |
| `customer` | No admin access | Public routes only |

---

## 🛠️ Common Tasks

### **Create Additional Admin Users**

**Option 1: MongoDB Compass**
1. Connect to `mongodb://localhost:27017`
2. Database: `chill-cine-hotel`
3. Collection: `users`
4. Insert document:
```json
{
  "email": "admin2@chillcine.com",
  "password": "$2a$10$...", // Use bcrypt to hash
  "name": "Admin 2",
  "role": "admin",
  "createdAt": "2024-01-01T00:00:00.000Z",
  "updatedAt": "2024-01-01T00:00:00.000Z"
}
```

**Option 2: Script (Recommended)**
Create `lib/scripts/create-user.ts`:
```typescript
import User from '../models/User'
import connectDB from '../mongodb'

async function createUser() {
  await connectDB()
  const user = await User.create({
    email: 'staff@chillcine.com',
    password: 'Staff@123',
    name: 'Staff User',
    role: 'staff',
  })
  console.log('User created:', user.email)
}

createUser()
```

Run:
```bash
tsx lib/scripts/create-user.ts
```

---

### **Change Password**

**Programmatically:**
```typescript
import User from './lib/models/User'
import connectDB from './lib/mongodb'

await connectDB()
const user = await User.findOne({ email: 'admin@chillcine.com' })
user.password = 'NewPassword@123' // Will be hashed by pre-save hook
await user.save()
```

**Manual (MongoDB):**
1. Generate hash: `bcrypt.hash('NewPassword@123', 10)`
2. Update document in MongoDB Compass

---

### **Debug Authentication Issues**

**Check Session:**
```typescript
'use client'
import { useSession } from 'next-auth/react'

export default function DebugPage() {
  const { data: session, status } = useSession()
  return (
    <div>
      <p>Status: {status}</p>
      <pre>{JSON.stringify(session, null, 2)}</pre>
    </div>
  )
}
```

**Check JWT Token:**
- Open DevTools → Application → Cookies
- Find: `next-auth.session-token` (dev) or `__Secure-next-auth.session-token` (prod)

**Check Middleware:**
Add console.log in `middleware.ts`:
```typescript
console.log('Token:', token)
console.log('Pathname:', request.nextUrl.pathname)
```

---

## 🎯 Next Steps

**Recommended Enhancements:**

1. **Password Reset Flow**
   - Email verification
   - Reset token generation
   - Password reset page

2. **Staff Role Permissions**
   - Limit staff to specific tabs
   - Hide sensitive stats
   - Read-only access to some data

3. **Activity Logging**
   - Track admin actions (create/update/delete)
   - Store in `admin_logs` collection
   - Display in dashboard

4. **2FA (Two-Factor Auth)**
   - TOTP (Google Authenticator)
   - SMS verification
   - Backup codes

5. **Session Management**
   - Active sessions list
   - Revoke sessions
   - Device tracking

---

## 🐛 Troubleshooting

### **Error: "Invalid session token"**
**Solution:**
- Delete cookies in browser
- Check `NEXTAUTH_SECRET` in `.env.local`
- Restart dev server

### **Redirect Loop**
**Solution:**
- Check middleware matcher config
- Ensure `/auth/login` is NOT in protected routes
- Clear browser cache

### **"Schema hasn't been registered"**
**Solution:**
- Import User from `lib/models/index.ts`
- Ensure `lib/models/User.ts` uses `export default`

### **TypeScript Errors**
**Solution:**
- Check `types/next-auth.d.ts` exists
- Restart TypeScript server: `Cmd+Shift+P` → "Restart TS Server"

---

## 📦 Dependencies

```json
{
  "next-auth": "^4.24.11",
  "bcryptjs": "^2.4.3",
  "lucide-react": "^0.468.0"
}
```

All installed ✅

---

## ✅ Completion Summary

**What Works:**
✅ Admin user seeded: `admin@chillcine.com` / `Admin@123`
✅ Login page with beautiful UI
✅ Middleware protects `/admin` routes
✅ Role-based access (admin + staff only)
✅ Session management with JWT
✅ Logout functionality
✅ User info display in dashboard
✅ Password hashing with bcrypt
✅ TypeScript type safety

**Ready to use!** 🎉

Login at: **http://localhost:3000/auth/login**
