# ✅ Admin Dashboard Implementation Checklist

## 📊 Phân tích hiện trạng

### Dashboard Components
- ✅ `/app/admin/page.tsx` - Main admin page
- ✅ `BookingsOverview` - Thống kê đặt phòng (**mock data**)
- ✅ `BranchesManager` - Quản lý chi nhánh (**mock data**)
- ✅ `RoomsManager` - Quản lý phòng (**mock data**)

### Vấn đề
- ❌ **Không có authentication** - Ai cũng truy cập được `/admin`
- ❌ **Mock data** - Chưa kết nối MongoDB
- ❌ **Không có audit log**
- ❌ **Không có user management**

---

## 🎯 Implementation Plan

### Phase 1: Authentication (HIGH PRIORITY) ⚠️

#### Step 1.1: Install Dependencies
```bash
npm install next-auth@latest bcryptjs
npm install -D @types/bcryptjs
```

#### Step 1.2: Create Files
- [ ] `lib/models/User.ts` - User model
- [ ] `app/api/auth/[...nextauth]/route.ts` - NextAuth config
- [ ] `types/next-auth.d.ts` - TypeScript types
- [ ] `app/auth/login/page.tsx` - Login page
- [ ] `components/session-provider.tsx` - Session wrapper
- [ ] `lib/scripts/seed-admin.ts` - Seed admin user

#### Step 1.3: Update Existing Files
- [ ] `lib/models/index.ts` - Export User model
- [ ] `app/admin/page.tsx` - Add auth check
- [ ] `app/layout.tsx` - Wrap with SessionProvider
- [ ] `.env` - Add NEXTAUTH_SECRET

#### Step 1.4: Testing
- [ ] Run `npm run db:seed-admin`
- [ ] Test login: `admin@chillcine.com` / `Admin@123`
- [ ] Test protected route `/admin`
- [ ] Test logout
- [ ] Test unauthorized access

---

### Phase 2: Migrate to MongoDB (MEDIUM PRIORITY)

#### Step 2.1: BookingsOverview
- [ ] Create API endpoint: GET `/api/admin/stats`
- [ ] Fetch real booking statistics from MongoDB
- [ ] Replace mock data with API calls
- [ ] Add loading states
- [ ] Add error handling

#### Step 2.2: BranchesManager
- [ ] Update: POST `/api/branches` - Create branch
- [ ] Update: PUT `/api/branches/:id` - Update branch
- [ ] Update: DELETE `/api/branches/:id` - Delete branch
- [ ] Replace mock CRUD with API calls
- [ ] Add optimistic updates
- [ ] Add toast notifications

#### Step 2.3: RoomsManager
- [ ] Update: POST `/api/rooms` - Create room
- [ ] Update: PUT `/api/rooms/:id` - Update room
- [ ] Update: DELETE `/api/rooms/:id` - Delete room
- [ ] Replace mock CRUD with API calls
- [ ] Add image upload (Cloudinary)
- [ ] Add validation

---

### Phase 3: Enhanced Features (LOW PRIORITY)

#### Step 3.1: User Management
- [ ] Create `/app/admin/users/page.tsx`
- [ ] API: GET/POST/PUT/DELETE `/api/admin/users`
- [ ] Change password feature
- [ ] Role management (admin/staff/user)
- [ ] Activate/Deactivate users

#### Step 3.2: Audit Logging
- [ ] Create `lib/models/AuditLog.ts`
- [ ] Middleware to log actions
- [ ] Display logs in admin
- [ ] Filter by user, action, date

#### Step 3.3: Dashboard Analytics
- [ ] Install chart library: `npm install recharts`
- [ ] Revenue chart by date
- [ ] Booking trends chart
- [ ] Room occupancy heatmap
- [ ] Top customers list

---

## 📋 Quick Start Guide

### 1. Implement Authentication NOW

```bash
# Terminal 1: Create User model
# Copy code from ADMIN_AUTHENTICATION_GUIDE.md

# Terminal 2: Install packages
npm install next-auth@latest bcryptjs
npm install -D @types/bcryptjs

# Terminal 3: Seed admin user
npm run db:seed-admin

# Terminal 4: Restart dev
npm run dev
```

### 2. Test Login

```
URL: http://localhost:3000/auth/login
Email: admin@chillcine.com
Password: Admin@123
```

### 3. Access Admin Dashboard

```
URL: http://localhost:3000/admin
Status: Protected - requires login ✅
```

---

## 🔧 Quick Commands

```bash
# Install auth packages
npm install next-auth@latest bcryptjs @types/bcryptjs

# Create admin user
npm run db:seed-admin

# Run dev server
npm run dev

# Check MongoDB users
mongosh
> use chill-cine-hotel
> db.users.find()
```

---

## 🐛 Common Issues

### Issue 1: NEXTAUTH_SECRET not set
**Error:** `[next-auth][error][NO_SECRET]`

**Fix:**
```bash
# .env
NEXTAUTH_SECRET=your-super-secret-key-here
```

Generate secret:
```bash
openssl rand -base64 32
```

### Issue 2: Cannot find module 'next-auth'
**Error:** `Module not found: Can't resolve 'next-auth'`

**Fix:**
```bash
npm install next-auth@latest
# Restart dev server
```

### Issue 3: Session undefined
**Error:** `session.user is undefined`

**Fix:**
1. Check `SessionProvider` wraps app in `layout.tsx`
2. Check `'use client'` in admin page
3. Check `useSession()` hook imported correctly

---

## 📊 Progress Tracking

### Current Status: Phase 0 ⚠️
- [x] Dashboard UI exists
- [ ] Authentication implemented
- [ ] MongoDB integration
- [ ] User management
- [ ] Audit logging

### Timeline Estimate
- **Phase 1 (Auth)**: 2-3 hours
- **Phase 2 (MongoDB)**: 4-6 hours
- **Phase 3 (Features)**: 6-8 hours
- **Total**: 12-17 hours

---

## 🎯 Immediate Action Items

### TODAY (Must Complete)
1. [ ] Install NextAuth packages
2. [ ] Create User model
3. [ ] Setup NextAuth route
4. [ ] Create login page
5. [ ] Protect admin route
6. [ ] Seed admin user
7. [ ] Test login/logout

### THIS WEEK
1. [ ] Migrate BookingsOverview to MongoDB
2. [ ] Migrate BranchesManager CRUD
3. [ ] Migrate RoomsManager CRUD
4. [ ] Add toast notifications
5. [ ] Add loading states

### NEXT WEEK
1. [ ] User management page
2. [ ] Audit logging
3. [ ] Dashboard charts
4. [ ] Advanced filters
5. [ ] Export reports

---

## 📚 References

- 📖 [ADMIN_AUTHENTICATION_GUIDE.md](./ADMIN_AUTHENTICATION_GUIDE.md) - Chi tiết đầy đủ
- 🔐 [NextAuth.js Docs](https://next-auth.js.org/)
- 🗄️ [MongoDB User Model Best Practices](https://mongoosejs.com/docs/guide.html)
- 🔒 [bcrypt Documentation](https://www.npmjs.com/package/bcryptjs)

---

## ✨ Summary

**What we have:**
- ✅ Admin UI components
- ❌ No authentication
- ❌ Mock data only

**What we need:**
1. 🔐 NextAuth authentication (URGENT)
2. 🗄️ MongoDB integration (HIGH)
3. 👥 User management (MEDIUM)
4. 📊 Analytics charts (LOW)

**Start with:** Phase 1 - Authentication (2-3 hours)
