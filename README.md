# 🎬 Chill Cine Hotel - Cinema Booking System

> Hệ thống đặt phòng xem phim riêng tư với thanh toán tự động và quản lý toàn diện

[![Next.js](https://img.shields.io/badge/Next.js-15.2.4-black)](https://nextjs.org/)
[![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-green)](https://www.mongodb.com/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9-blue)](https://www.typescriptlang.org/)
[![Vercel](https://img.shields.io/badge/Deploy-Vercel-black)](https://vercel.com)

---

## ✨ Tính Năng

### 🎯 Khách Hàng
- **Đặt phòng dễ dàng:** Chọn chi nhánh, xem phòng, chọn giờ
- **Combo packages:** Đặt theo combo giờ với giá ưu đãi
- **Timeline realtime:** Xem phòng còn trống theo giờ
- **Thanh toán QR Code:** Tích hợp Pay2S gateway
- **Auto-cancel:** Tự động hủy booking sau 10 phút chưa thanh toán
- **Menu đồ uống/ăn:** Order thêm dịch vụ khi đặt phòng

### 👨‍💼 Admin Dashboard
- **Quản lý chi nhánh:** CRUD branches, cities
- **Quản lý phòng:** CRUD rooms, room types, amenities
- **Quản lý combo:** Tạo combo giờ đặc biệt
- **Quản lý menu:** Đồ uống, đồ ăn, snacks
- **Theo dõi booking:** Xem tất cả bookings, lọc theo status
- **Dashboard analytics:** Charts, thống kê

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | Next.js 15 (App Router), React 19, TypeScript |
| **Styling** | TailwindCSS 4, Radix UI, shadcn/ui |
| **Backend** | Next.js API Routes, Mongoose ODM |
| **Database** | MongoDB Atlas |
| **Authentication** | NextAuth.js v4 |
| **Payment** | Pay2S Gateway (QR Code) |
| **Cron Jobs** | Vercel Cron (auto-cancel bookings) |
| **Deployment** | Vercel (Serverless) |

---

## 🚀 Quick Start

### 1. **Prerequisites**

```bash
Node.js >= 18.x
pnpm >= 8.x
MongoDB Atlas account
```

### 2. **Installation**

```bash
# Clone repository
git clone https://github.com/Anfind/Chill_Cine_Booking.git
cd Chill_Cine_Booking

# Install dependencies
pnpm install
```

### 3. **Environment Setup**

```bash
# Copy example env
cp .env.example .env.local

# Edit .env.local with your credentials:
# - MONGODB_URI (MongoDB Atlas connection string)
# - NEXTAUTH_SECRET (generate with: openssl rand -base64 32)
# - Pay2S credentials
```

### 4. **Database Seeding**

```bash
pnpm db:seed
```

Seed script sẽ tạo:
- Admin user: `admin@chillcine.com` / `Admin@123`
- Sample cities, branches, room types, rooms
- Sample combo packages và menu items

### 5. **Run Development Server**

```bash
pnpm dev
```

Mở [http://localhost:3000](http://localhost:3000)

---

## 📁 Project Structure

```
booking-app/
├── app/                    # Next.js App Router
│   ├── api/               # API routes
│   ├── admin/             # Admin dashboard
│   ├── auth/              # Authentication pages
│   ├── booking/           # Booking flow
│   ├── payment/           # Payment pages
│   └── rooms/             # Room listing
├── components/            # React components
│   ├── admin/            # Admin components
│   └── ui/               # shadcn/ui components
├── lib/                   # Core utilities
│   ├── models/           # Mongoose models
│   ├── scripts/          # Seed scripts
│   └── cron/             # Cron job handlers
├── types/                 # TypeScript definitions
└── public/               # Static assets
```

---

## 🔐 Authentication

**Admin Login:**
- URL: `http://localhost:3000/auth/login`
- Email: `admin@chillcine.com`
- Password: `Admin@123`

**Protected Routes:**
- `/admin/*` - Chỉ admin/staff
- Middleware tự động redirect nếu chưa login

---

## 💳 Payment Integration

**Pay2S Gateway:**
- QR Code payment
- Real-time payment status
- IPN webhook for auto-confirmation
- Support bank transfer

**Payment Flow:**
1. User đặt phòng → Generate booking
2. Redirect to payment page → Show QR Code
3. User scan QR → Transfer money
4. Pay2S webhook → Update booking status to 'confirmed'
5. Auto-cancel after 10 minutes if unpaid

---

## 🕐 Cron Jobs

**Auto-cancel Bookings:**
- **Local:** Chạy mỗi 2 phút (node-cron)
- **Production:** Chạy mỗi 10 phút (Vercel Cron)
- **Logic:** Hủy bookings pending > 10 phút chưa thanh toán

---

## 🚢 Deployment

### Deploy to Vercel

Xem hướng dẫn chi tiết trong [`DEPLOYMENT.md`](./DEPLOYMENT.md)

**Quick Deploy:**

```bash
# Push to GitHub
git push origin main

# Import to Vercel
# - Connect GitHub repo
# - Add environment variables
# - Deploy
```

**Environment Variables Required:**
- `MONGODB_URI`
- `NEXTAUTH_SECRET`
- `NEXTAUTH_URL`
- `CRON_SECRET`
- `PAY2S_*` (credentials)

---

## 📚 API Endpoints

### Public APIs
```
GET  /api/cities              # Danh sách cities
GET  /api/branches            # Danh sách branches
GET  /api/branches/[id]       # Chi tiết branch
GET  /api/rooms              # Danh sách rooms
GET  /api/combos             # Danh sách combo packages
GET  /api/menu-items         # Danh sách menu items
POST /api/bookings           # Tạo booking mới
```

### Admin APIs (Protected)
```
POST   /api/branches          # Tạo branch
PUT    /api/branches/[id]     # Cập nhật branch
DELETE /api/branches/[id]     # Xóa branch

POST   /api/rooms            # Tạo room
PUT    /api/rooms/[roomId]   # Cập nhật room
DELETE /api/rooms/[roomId]   # Xóa room

POST   /api/combos           # Tạo combo
PUT    /api/combos/[comboId] # Cập nhật combo
DELETE /api/combos/[comboId] # Xóa combo

GET    /api/admin/stats      # Dashboard stats
```

### Cron APIs (Protected)
```
POST /api/bookings/cleanup   # Auto-cancel expired bookings
GET  /api/cron/status        # Cron job status
```

---

## 🧪 Scripts

```bash
pnpm dev          # Start dev server
pnpm build        # Build for production
pnpm start        # Start production server
pnpm lint         # Run ESLint
pnpm db:seed      # Seed database
```

---

## 🐛 Troubleshooting

### MongoDB Connection Error
**Nguyên nhân:** Connection string sai hoặc IP chưa whitelist

**Giải pháp:**
- Kiểm tra `MONGODB_URI` trong `.env.local`
- MongoDB Atlas → Network Access → Add IP `0.0.0.0/0`

### NextAuth Error
**Nguyên nhân:** `NEXTAUTH_SECRET` chưa đủ mạnh

**Giải pháp:**
```bash
openssl rand -base64 32
```

### Payment Gateway Error
**Nguyên nhân:** Pay2S credentials sai

**Giải pháp:**
- Kiểm tra credentials trong `.env.local`
- Verify callback URLs trong Pay2S dashboard

---

## 📝 License

MIT License - xem [LICENSE](./LICENSE)

---

## 👥 Contributors

- **Nguyễn Thái An** - Developer

---

## 📞 Support

- **Email:** support@chillcine.com
- **Hotline:** 0989 760 000
- **GitHub Issues:** [Create Issue](https://github.com/Anfind/Chill_Cine_Booking/issues)

---

**Made with ❤️ by Chill Cine Team**
