# 🚀 Quick Reference - Chill Cine Hotel

## 📌 Lệnh Thường Dùng

### Development
```bash
# Start dev server
pnpm dev

# Build production
pnpm build

# Start production
pnpm start

# Lint code
pnpm lint
```

### Database
```bash
# Seed database
pnpm db:seed

# Start MongoDB (Windows)
net start MongoDB

# Stop MongoDB (Windows)
net stop MongoDB

# Restart MongoDB (Windows)
net stop MongoDB && net start MongoDB

# MongoDB shell
mongosh

# Use database
mongosh
> use chill-cine-hotel
> show collections
> db.cities.find()
```

### MongoDB Queries Cheat Sheet

```javascript
// Connect to database
use chill-cine-hotel

// === CITIES ===
db.cities.find()                           // Tất cả cities
db.cities.find({ code: "hcm" })           // City theo code
db.cities.countDocuments()                 // Đếm số cities

// === BRANCHES ===
db.branches.find()                         // Tất cả branches
db.branches.find({ cityId: ObjectId("...") })  // Branches của city
db.branches.countDocuments()               // Đếm số branches

// === ROOM TYPES ===
db.roomtypes.find()                        // Tất cả room types
db.roomtypes.find({ slug: "classic" })    // Room type theo slug

// === ROOMS ===
db.rooms.find()                            // Tất cả rooms
db.rooms.find({ branchId: ObjectId("...") })   // Rooms của branch
db.rooms.find({ capacity: 2 })            // Rooms 2 người
db.rooms.find({ status: "available" })    // Rooms trống
db.rooms.countDocuments()                  // Đếm số rooms

// === COMBO PACKAGES ===
db.combopackages.find().sort({ displayOrder: 1 })  // Tất cả combos
db.combopackages.find({ isSpecial: true })         // Special combos

// === MENU ITEMS ===
db.menuitems.find().sort({ displayOrder: 1 })      // Tất cả menu
db.menuitems.find({ category: "drink" })           // Menu đồ uống

// === BOOKINGS ===
db.bookings.find()                         // Tất cả bookings
db.bookings.find({ status: "confirmed" })  // Bookings confirmed
db.bookings.find({ roomId: ObjectId("...") })      // Bookings của room
db.bookings.countDocuments()               // Đếm số bookings

// === AGGREGATIONS ===
// Đếm rooms theo branch
db.rooms.aggregate([
  { $group: { _id: "$branchId", count: { $sum: 1 } } }
])

// Đếm rooms theo capacity
db.rooms.aggregate([
  { $group: { _id: "$capacity", count: { $sum: 1 } } }
])

// Total revenue từ bookings
db.bookings.aggregate([
  { $group: { _id: null, total: { $sum: "$pricing.total" } } }
])
```

---

## 📁 File Paths Reference

### Models
```
lib/models/City.ts
lib/models/Branch.ts
lib/models/RoomType.ts
lib/models/Room.ts
lib/models/ComboPackage.ts
lib/models/MenuItem.ts
lib/models/Booking.ts
```

### Pages
```
app/page.tsx                  # Homepage
app/rooms/[branchId]/page.tsx # Rooms list
app/booking/[roomId]/page.tsx # Booking page
app/payment/page.tsx          # Payment page
app/admin/page.tsx            # Admin dashboard
```

### Components
```
components/booking-form.tsx
components/timeline-booking.tsx
components/location-selector.tsx
components/room-details-panel.tsx
components/bottom-nav.tsx
components/admin/bookings-overview.tsx
components/admin/branches-manager.tsx
components/admin/rooms-manager.tsx
```

---

## 🌐 URLs

### Development
```
Homepage:        http://localhost:3000
Rooms (Q1):      http://localhost:3000/rooms/hcm-q1
Booking (Room):  http://localhost:3000/booking/g01
Payment:         http://localhost:3000/payment
Admin:           http://localhost:3000/admin
```

### API Routes (Sẽ tạo)
```
GET    /api/cities
GET    /api/branches?cityId=xxx
GET    /api/branches/[id]
GET    /api/rooms?branchId=xxx
GET    /api/rooms/[id]
GET    /api/combos
GET    /api/menu
GET    /api/bookings/[id]
POST   /api/bookings
PATCH  /api/bookings/[id]
```

---

## 📊 Database Info

### Connection String
```
mongodb://localhost:27017/chill-cine-hotel
```

### Collections & Documents
```
cities:         4 documents
branches:       7 documents
roomtypes:      3 documents
rooms:         28 documents
combopackages:  6 documents
menuitems:      5 documents
bookings:       0+ documents
```

### Sample ObjectIds
```javascript
// Run in mongosh để lấy ObjectIds:
use chill-cine-hotel
db.cities.findOne({ code: "hcm" })._id
db.branches.findOne({ slug: "chi-nhanh-quan-1" })._id
db.rooms.findOne({ code: "R01" })._id
```

---

## 🎨 Color Palette

### Primary Colors
```css
--pink-500:    #ec4899
--purple-500:  #8b5cf6
--purple-600:  #7c3aed
```

### Room Type Colors
```
Classic:  #ec4899 (Pink)
Luxury:   #8b5cf6 (Purple)
VIP:      #f59e0b (Orange)
```

---

## 💰 Pricing Quick Reference

### Combo Packages
```
COMBO 2H  : 159,000đ (2h)
COMBO 4H  : 239,000đ (4h)
COMBO 6H  : 309,000đ (6h)
COMBO 10H : 369,000đ (10h)
QUA ĐÊM   : 409,000đ (21H-12H, 15h)
NGÀY      : 499,000đ (14H-12H, 22h)

Extra Fee: 50,000đ/h
```

### Hourly Rates
```
2 người: 80,000đ/h
4 người: 100,000đ/h
```

### Menu
```
Nước suối : 10,000đ
Nước ngọt : 20,000đ
Đồ ăn sặy : 40,000đ
Snack     : 10,000đ
BCS thêm  : 15,000đ
```

---

## 🔧 Environment Variables

```env
# MongoDB
MONGODB_URI=mongodb://localhost:27017/chill-cine-hotel

# App Config
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_HOTLINE=0989760000

# NextAuth (Optional)
NEXTAUTH_SECRET=your-secret-key-here
NEXTAUTH_URL=http://localhost:3000

# Payment (Coming soon)
VNPAY_TMN_CODE=
VNPAY_HASH_SECRET=
MOMO_PARTNER_CODE=
MOMO_ACCESS_KEY=
```

---

## 📱 Contact Info

```
Hotline:  0989.76.0000
Email:    support@chillcine.com
Website:  [Coming soon]
```

---

## 🐛 Debugging Tips

### Kiểm tra MongoDB connection
```typescript
// Thêm vào bất kỳ API route nào
import connectDB from '@/lib/mongodb'

export async function GET() {
  try {
    await connectDB()
    return Response.json({ status: 'connected' })
  } catch (error) {
    return Response.json({ status: 'error', error: error.message })
  }
}
```

### Clear Next.js cache
```bash
rm -rf .next
pnpm dev
```

### Reset database
```bash
# Xóa tất cả collections
mongosh
> use chill-cine-hotel
> db.dropDatabase()

# Seed lại
pnpm db:seed
```

---

## 📚 Documentation Links

- [Next.js Docs](https://nextjs.org/docs)
- [MongoDB Docs](https://www.mongodb.com/docs/)
- [Mongoose Docs](https://mongoosejs.com/docs/)
- [TailwindCSS Docs](https://tailwindcss.com/docs)
- [shadcn/ui](https://ui.shadcn.com/)

---

## 🎯 Git Workflow

```bash
# Create feature branch
git checkout -b feature/booking-api

# Make changes
git add .
git commit -m "feat: add booking API endpoints"

# Push to remote
git push origin feature/booking-api

# Merge to main (after review)
git checkout main
git merge feature/booking-api
git push origin main
```

---

**Quick Reference v1.0 - October 15, 2025**
