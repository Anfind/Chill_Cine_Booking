## Admin Dashboard

The admin panel lets you manage branches and rooms with real MongoDB persistence (no mock data).

### URL
- Development: http://localhost:3000/admin (or your current dev port)

### Prerequisites
- MongoDB running locally (mongodb://localhost:27017)
- Database used: `chill-cine-hotel`
- Seed data recommended: at least some Cities and Room Types

### Quick start
1) Start the dev server
   - pnpm dev
2) Open `/admin`
3) Use the tabs to manage:
   - Tổng quan: simple mock stats preview (non-blocking)
   - Chi nhánh: create/update/delete branches (saved to DB)
   - Phòng: create/update/delete rooms, filter by branch, select room type (saved to DB)

### Features
- Branches
  - Create, edit, soft-delete (isActive=false)
  - City selection from `/api/cities`
  - Phone optional
- Rooms
  - Create, edit, soft-delete (isActive=false)
  - Filter by branch
  - Room type selection from `/api/room-types`
  - Fields: name, description, images, amenities, capacity, price, status

### API Endpoints
- Branches: `/api/branches`, `/api/branches/[id]`
- Rooms: `/api/rooms`, `/api/rooms/[id]`
- Cities: `/api/cities`
- Room Types: `/api/room-types`

### First-time seeding (optional)
Use mongosh to insert some Cities and Room Types:

```javascript
use chill_cine_hotel

db.cities.insertMany([
  { name: 'TP. HCM', code: 'HCM' },
  { name: 'Hà Nội', code: 'HN' },
])

db.roomtypes.insertMany([
  { name: 'Phòng tiêu chuẩn', slug: 'standard', color: '#6366f1' },
  { name: 'Phòng gia đình', slug: 'family', color: '#22c55e' },
])
```

Note: collection names may differ depending on your Mongoose model config. If the above names don’t match, create a branch and a room from the UI to see the actual collection names, then adjust commands accordingly.

### Troubleshooting
- Can’t load lists (branches/rooms)?
  - Ensure MongoDB is running
  - Check server console for API errors
  - Verify you have at least 1 City (for branches) and 1 Room Type (for rooms)
- CORS when testing via ngrok
  - This repo sets relative API calls and includes CORS middleware already
- Admin auth
  - Not enforced yet; see `ADMIN_AUTHENTICATION_GUIDE.md` for adding NextAuth

# 🎬 Chill Cine Hotel - Cinema Booking System

> **Mobile-First** Cinema Room Booking Platform built with Next.js 15, MongoDB, and TypeScript

![Version](https://img.shields.io/badge/version-1.0.0-blue)
![Next.js](https://img.shields.io/badge/Next.js-15.2.4-black)
![MongoDB](https://img.shields.io/badge/MongoDB-7.0-green)
![TypeScript](https://img.shields.io/badge/TypeScript-5.9-blue)
![License](https://img.shields.io/badge/license-MIT-green)

---

## 📱 About

**Chill Cine Hotel - CINEMAX** là hệ thống đặt phòng xem phim riêng tư, được thiết kế tối ưu cho mobile. Khách hàng có thể:

- 🎬 Đặt phòng cinema riêng tư
- 📺 Xem Netflix & Youtube
- 🎮 Chơi board game
- 🛋️ Không gian couple hoặc nhóm bạn
- 💰 Chọn combo giờ hoặc giá theo giờ
- 🍿 Order đồ ăn, uống

---

## ✨ Features

### 🎯 Customer Features
- ✅ Chọn chi nhánh theo tỉnh/thành
- ✅ Xem danh sách phòng với hình ảnh
- ✅ Timeline booking trực quan
- ✅ Chọn combo package hoặc giờ tùy chỉnh
- ✅ Thêm menu items (đồ ăn, uống)
- ✅ Multiple payment methods
- ✅ Booking confirmation

### 🔧 Admin Features
- ✅ Quản lý chi nhánh
- ✅ Quản lý phòng
- ✅ Dashboard thống kê
- ✅ Xem booking overview

---

## 🛠️ Tech Stack

- **Framework:** [Next.js 15](https://nextjs.org/) (App Router)
- **Database:** [MongoDB](https://www.mongodb.com/) 7.0+
- **ODM:** [Mongoose](https://mongoosejs.com/) 8.19+
- **Language:** [TypeScript](https://www.typescriptlang.org/) 5.9
- **UI Library:** [React 19](https://react.dev/)
- **Styling:** [TailwindCSS 4](https://tailwindcss.com/)
- **Components:** [Radix UI](https://www.radix-ui.com/) + [shadcn/ui](https://ui.shadcn.com/)
- **Forms:** [React Hook Form](https://react-hook-form.com/) + [Zod](https://zod.dev/)
- **Package Manager:** [pnpm](https://pnpm.io/)

---

## 🚀 Quick Start

### Prerequisites

- **Node.js** 18+ 
- **pnpm** 8+
- **MongoDB** 7.0+ (Local or Docker)

### Installation

```bash
# 1. Clone repository
git clone https://github.com/yourusername/chill-cine-hotel.git
cd chill-cine-hotel

# 2. Install dependencies
pnpm install

# 3. Setup environment variables
cp .env.example .env.local
# Edit .env.local with your MongoDB URI

# 4. Start MongoDB
# Option A: Local MongoDB
net start MongoDB

# Option B: Docker
docker run -d -p 27017:27017 --name mongodb mongo:7.0

# 5. Seed database
pnpm db:seed

# 6. Run development server
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) 🎉

---

## 📁 Project Structure

```
chill-cine-hotel/
├── app/                      # Next.js App Router
│   ├── page.tsx             # Homepage (location selector)
│   ├── layout.tsx           # Root layout
│   ├── admin/               # Admin dashboard
│   ├── booking/[roomId]/    # Booking page
│   ├── payment/             # Payment page
│   └── rooms/[branchId]/    # Room list page
├── components/              # React components
│   ├── booking-form.tsx
│   ├── timeline-booking.tsx
│   ├── location-selector.tsx
│   ├── room-details-panel.tsx
│   ├── bottom-nav.tsx
│   ├── admin/               # Admin components
│   └── ui/                  # shadcn/ui components
├── lib/
│   ├── mongodb.ts           # Database connection
│   ├── models/              # Mongoose models
│   │   ├── City.ts
│   │   ├── Branch.ts
│   │   ├── RoomType.ts
│   │   ├── Room.ts
│   │   ├── ComboPackage.ts
│   │   ├── MenuItem.ts
│   │   └── Booking.ts
│   ├── scripts/
│   │   └── seed.ts          # Database seeder
│   ├── data.ts              # (Legacy mock data)
│   └── utils.ts             # Utilities
├── public/                  # Static assets
├── .env.local              # Environment variables
├── DATABASE.md             # Database setup guide
├── DATABASE_SCHEMA.md      # Schema documentation
├── SUMMARY.md              # Project summary
└── package.json
```

---

## 🗄️ Database Schema

### Collections

```
chill-cine-hotel
├── cities          (4 docs)   - Tỉnh/Thành phố
├── branches        (7 docs)   - Chi nhánh
├── roomtypes       (3 docs)   - Loại phòng (Classic, Luxury, VIP)
├── rooms           (28 docs)  - Phòng cinema
├── combopackages   (6 docs)   - Gói combo giá
├── menuitems       (5 docs)   - Menu đồ ăn/uống
└── bookings        (0+ docs)  - Đặt phòng
```

### Hierarchy

```
🌍 CITY → 🏢 BRANCH → 🚪 ROOM → 📝 BOOKING
```

**Xem chi tiết:** [DATABASE_SCHEMA.md](./DATABASE_SCHEMA.md)

---

## 💰 Pricing

### Combo Packages
```
✨ COMBO 2H   : 159,000đ (2 giờ)
✨ COMBO 4H   : 239,000đ (4 giờ)
✨ COMBO 6H   : 309,000đ (6 giờ)
✨ COMBO 10H  : 369,000đ (10 giờ)
✨ QUA ĐÊM    : 409,000đ (21H-12H)
✨ NGÀY       : 499,000đ (14H-12H)
```

### Hourly Rate
```
💰 Couple Room (2 người): 80,000đ/giờ
💰 Group Room (4 người):  100,000đ/giờ
```

### Add-ons
```
🥤 Nước suối  : 10,000đ
🥤 Nước ngọt  : 20,000đ
🍔 Đồ ăn sặy  : 40,000đ
🍿 Snack      : 10,000đ
⭐ BCS thêm   : 15,000đ
```

---

## 📜 Available Scripts

```bash
# Development
pnpm dev          # Start dev server (localhost:3000)
pnpm build        # Build for production
pnpm start        # Start production server
pnpm lint         # Run ESLint

# Database
pnpm db:seed      # Seed database with sample data
```

---

## 🌍 Locations

### 4 Cities
- 🏙️ **TP. Hồ Chí Minh** (3 branches)
- 🏙️ **Hà Nội** (2 branches)
- 🏙️ **Đà Nẵng** (1 branch)
- 🏙️ **Cần Thơ** (1 branch)

### 7 Branches
```
HCM: Quận 1, Quận 3, Thủ Đức
HN:  Hoàn Kiếm, Cầu Giấy
ĐN:  Hải Châu
CT:  Ninh Kiều
```

---

## 📱 Mobile-First Design

✅ Responsive design (mobile/tablet/desktop)
✅ Touch-optimized UI
✅ Swipe gestures for timeline
✅ Bottom navigation bar
✅ Fast loading on 3G/4G
✅ Minimal form filling

---

## 🔐 Environment Variables

Create `.env.local`:

```env
# MongoDB
MONGODB_URI=mongodb://localhost:27017/chill-cine-hotel

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_HOTLINE=0989760000

# Auth (optional)
NEXTAUTH_SECRET=your-secret-key
NEXTAUTH_URL=http://localhost:3000
```

---

## 🧪 Testing

```bash
# Coming soon
pnpm test        # Run tests
pnpm test:watch  # Watch mode
```

---

## 📊 Monitoring

- **Analytics:** Vercel Analytics (enabled)
- **Error Tracking:** Coming soon
- **Performance:** Built-in Next.js monitoring

---

## 🎯 Roadmap

### ✅ Phase 1: Foundation (Completed)
- [x] Next.js setup with App Router
- [x] MongoDB database design
- [x] Mongoose models
- [x] UI components library
- [x] Mobile-first responsive design
- [x] Database seeder

### 🚧 Phase 2: Core Features (In Progress)
- [ ] API routes for CRUD operations
- [ ] Real-time availability checking
- [ ] Booking conflict detection
- [ ] Payment integration (VNPay, MoMo, ZaloPay)

### 📅 Phase 3: Advanced Features
- [ ] User authentication (NextAuth.js)
- [ ] Email/SMS notifications
- [ ] Admin analytics dashboard
- [ ] Reviews & ratings system
- [ ] Promo codes & discounts

### 🎨 Phase 4: Enhancement
- [ ] Multi-language support
- [ ] Dark mode
- [ ] PWA (Progressive Web App)
- [ ] Mobile app (React Native)

---

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the project
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 📞 Contact

**Chill Cine Hotel - CINEMAX**

- 📱 Hotline: **0989.76.0000**
- 🌐 Website: [Coming soon]
- 📧 Email: support@chillcine.com

---

## 🙏 Acknowledgments

- [Next.js](https://nextjs.org/) - React framework
- [MongoDB](https://www.mongodb.com/) - Database
- [Vercel](https://vercel.com/) - Hosting platform
- [shadcn/ui](https://ui.shadcn.com/) - UI components
- [Radix UI](https://www.radix-ui.com/) - Headless components

---

<p align="center">
  Made with ❤️ for cinema lovers
</p>

<p align="center">
  <strong>Happy Booking! 🎬🍿</strong>
</p>
