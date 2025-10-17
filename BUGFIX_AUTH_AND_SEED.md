# 🔧 BUG FIXES & IMPROVEMENTS

## 📅 Ngày: 17/10/2025

---

## ✅ ĐÃ SỬA

### 1. **Lỗi 500 khi đăng nhập Admin** 🔐

**Vấn đề:**
- NextAuth không thể query password từ User model
- User schema có `select: false` cho password field
- Authorize function không select password explicitly

**Giải pháp:**
```typescript
// app/api/auth/[...nextauth]/route.ts
const user = await User.findOne({ email: credentials.email }).select('+password')
```

✅ **Kết quả:** Admin có thể đăng nhập bình thường với credentials:
- Email: `admin@chillcine.com`
- Password: `Admin@123`

---

### 2. **Gộp Seed Scripts** 📦

**Vấn đề:**
- Có 2 seed scripts riêng biệt:
  - `pnpm db:seed` - seed data (cities, branches, rooms, combos, menu, bookings)
  - `pnpm db:seed-admin` - seed admin user
- Phải chạy 2 lần → phiền phức và dễ quên

**Giải pháp:**
- Gộp admin user creation vào `lib/scripts/seed.ts`
- Xóa file `lib/scripts/seed-admin.ts`
- Cập nhật `package.json` scripts

✅ **Kết quả:** Chỉ cần chạy 1 lệnh:
```bash
pnpm db:seed
```

Seed script sẽ tạo:
- ✅ 4 Cities (HCM, HN, DN, CT)
- ✅ 7 Branches
- ✅ 3 Room Types (Classic, Luxury, VIP)
- ✅ 28 Rooms (4 rooms/branch)
- ✅ 6 Combo Packages
- ✅ 5 Menu Items
- ✅ 13 Sample Bookings (5 today + 8 tomorrow)
- ✅ 1 Admin User (admin@chillcine.com / Admin@123)

---

## 📝 FILES MODIFIED

### 1. `app/api/auth/[...nextauth]/route.ts`
```typescript
// Before
const user = await User.findOne({ email: credentials.email })

// After
const user = await User.findOne({ email: credentials.email }).select('+password')
```

### 2. `lib/scripts/seed.ts`
- Import User model
- Clear User collection
- Create admin user after bookings
- Log admin credentials

### 3. `package.json`
- Removed `db:seed-admin` script
- Keep only `db:seed`

### 4. `README.md`
- Updated seeding instructions
- Added admin credentials info

### 5. `lib/scripts/seed-admin.ts`
- ❌ **DELETED** (merged into seed.ts)

---

## 🎯 HOW TO USE

### Fresh Setup
```bash
# 1. Install dependencies
pnpm install

# 2. Setup environment
cp .env.example .env.local
# Edit MONGODB_URI, NEXTAUTH_SECRET

# 3. Start MongoDB
# (Make sure MongoDB is running on localhost:27017)

# 4. Seed database (ALL data + admin user)
pnpm db:seed

# 5. Start dev server
pnpm dev
```

### Login to Admin
1. Go to: http://localhost:3000/auth/login
2. Enter credentials:
   - Email: `admin@chillcine.com`
   - Password: `Admin@123`
3. Click "Đăng nhập"
4. Redirected to: http://localhost:3000/admin

---

## 🐛 TROUBLESHOOTING

### Nếu vẫn lỗi 500 khi login:

1. **Kiểm tra MongoDB running:**
   ```bash
   mongosh
   # Nếu connect được → OK
   ```

2. **Kiểm tra seed đã chạy chưa:**
   ```bash
   pnpm db:seed
   # Check output có "✅ Created admin user" không
   ```

3. **Verify admin user trong DB:**
   ```bash
   mongosh
   use chillcinehotel
   db.users.findOne({ email: 'admin@chillcine.com' })
   # Phải thấy user record
   ```

4. **Kiểm tra NEXTAUTH_SECRET:**
   ```bash
   # .env.local phải có:
   NEXTAUTH_SECRET=your-secret-key-here-minimum-32-chars
   ```

5. **Clear cache và restart:**
   ```bash
   rm -rf .next
   pnpm dev
   ```

---

## 📊 SEED OUTPUT EXAMPLE

```
🌱 Starting database seeding...
✅ Cleared existing data
✅ Created 4 cities
✅ Created 7 branches
✅ Created 3 room types
✅ Created 28 rooms
✅ Created 6 combo packages
✅ Created 5 menu items
✅ Created 13 sample bookings

👤 Creating admin user...
✅ Created admin user

🎉 Database seeded successfully!
📊 Summary:
   - Cities: 4
   - Branches: 7
   - Room Types: 3
   - Rooms: 28
   - Combo Packages: 6
   - Menu Items: 5
   - Sample Bookings: 13
   - Admin User: 1

📅 Booking dates:
   - Today (17/10/2025): 5 bookings
   - Tomorrow (18/10/2025): 8 bookings

🔐 Admin Login:
   - Email: admin@chillcine.com
   - Password: Admin@123
   - URL: http://localhost:3000/auth/login
```

---

## ✨ BENEFITS

1. **Đơn giản hơn:** Chỉ 1 lệnh seed thay vì 2
2. **Ít lỗi hơn:** Không quên seed admin
3. **Consistent:** Tất cả data được seed cùng lúc
4. **Login works:** Fix lỗi 500, admin có thể đăng nhập

---

## 🚀 NEXT STEPS

Bây giờ có thể:
- ✅ Login admin dashboard
- ✅ Quản lý branches
- ✅ Quản lý rooms
- ✅ Xem bookings overview
- ✅ Test full booking flow

---

**Happy Coding! 🎬✨**
