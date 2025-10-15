# ✅ CHECKLIST - Chill Cine Hotel Setup

## 📋 Database Setup

### MongoDB Installation
- [ ] Đã cài MongoDB Community Server 7.0+ **HOẶC**
- [ ] Đã cài Docker và chạy MongoDB container
- [ ] Test connection: `mongosh` chạy thành công
- [ ] MongoDB service đang chạy: `net start MongoDB`

### Database Configuration
- [x] File `.env.local` đã tạo với MONGODB_URI
- [x] File `lib/mongodb.ts` connection handler
- [x] 7 Mongoose models đã tạo:
  - [x] City.ts
  - [x] Branch.ts
  - [x] RoomType.ts
  - [x] Room.ts
  - [x] ComboPackage.ts
  - [x] MenuItem.ts
  - [x] Booking.ts

### Dependencies
- [x] `mongoose@8.19.1` đã cài
- [x] `tsx@4.20.6` đã cài (để chạy seed script)

### Seed Data
- [ ] Chạy `pnpm db:seed` thành công
- [ ] Kiểm tra data trong MongoDB Compass
- [ ] Verify số lượng documents:
  - [ ] 4 cities
  - [ ] 7 branches
  - [ ] 3 room types
  - [ ] 28 rooms
  - [ ] 6 combo packages
  - [ ] 5 menu items

---

## 🎯 NEXT STEPS

### Phase 1: API Routes (Ưu tiên cao)

#### 1.1 Cities API
- [ ] `GET /api/cities` - Lấy danh sách cities
- [ ] Test với Postman/Thunder Client

#### 1.2 Branches API
- [ ] `GET /api/branches?cityId=xxx` - Lấy branches theo city
- [ ] `GET /api/branches/[id]` - Chi tiết branch
- [ ] Test API

#### 1.3 Rooms API
- [ ] `GET /api/rooms?branchId=xxx` - Lấy rooms theo branch
- [ ] `GET /api/rooms/[id]` - Chi tiết room
- [ ] Test API

#### 1.4 Combo Packages API
- [ ] `GET /api/combos` - Lấy danh sách combo
- [ ] Test API

#### 1.5 Menu Items API
- [ ] `GET /api/menu` - Lấy menu items
- [ ] Test API

#### 1.6 Bookings API
- [ ] `POST /api/bookings` - Tạo booking mới
- [ ] `GET /api/bookings/[id]` - Chi tiết booking
- [ ] `GET /api/bookings?roomId=xxx&date=xxx` - Lấy bookings theo phòng & ngày
- [ ] `PATCH /api/bookings/[id]` - Update booking status
- [ ] Test các API

---

### Phase 2: UI Migration (Sau khi API xong)

#### 2.1 Homepage (`app/page.tsx`)
- [ ] Fetch cities từ API thay vì mock data
- [ ] Update LocationSelector component
- [ ] Test chức năng chọn city

#### 2.2 Rooms List (`app/rooms/[branchId]/page.tsx`)
- [ ] Fetch branch info từ API
- [ ] Fetch rooms từ API
- [ ] Update RoomsClient component
- [ ] Test hiển thị rooms

#### 2.3 Booking Page (`app/booking/[roomId]/page.tsx`)
- [ ] Fetch room info từ API
- [ ] Fetch existing bookings từ API
- [ ] Update TimelineBooking component
- [ ] Update BookingForm component
- [ ] Test timeline và form

#### 2.4 Payment Page (`app/payment/page.tsx`)
- [ ] Submit booking data qua API
- [ ] Handle payment confirmation
- [ ] Test flow đặt phòng end-to-end

#### 2.5 Admin Pages (`app/admin/`)
- [ ] Fetch real data cho dashboard
- [ ] Update BranchesManager với API
- [ ] Update RoomsManager với API
- [ ] Test CRUD operations

---

### Phase 3: Real-time Booking System

#### 3.1 Availability Checking
- [ ] API check phòng trống theo thời gian
- [ ] Detect conflict bookings
- [ ] Real-time update timeline
- [ ] Prevent double booking

#### 3.2 Booking Confirmation
- [ ] Generate unique booking code
- [ ] Send confirmation (SMS/Email)
- [ ] Save booking to database
- [ ] Update room availability

---

### Phase 4: Payment Integration

#### 4.1 VNPay
- [ ] Setup VNPay credentials
- [ ] Create payment URL
- [ ] Handle payment callback
- [ ] Update payment status

#### 4.2 MoMo
- [ ] Setup MoMo credentials
- [ ] Integration similar to VNPay

#### 4.3 ZaloPay
- [ ] Setup ZaloPay credentials
- [ ] Integration

---

### Phase 5: Authentication (Optional)

- [ ] NextAuth.js setup
- [ ] Login/Register pages
- [ ] User profile
- [ ] Booking history
- [ ] Protected admin routes

---

### Phase 6: Notifications

- [ ] Email service (Resend/SendGrid)
- [ ] SMS service (Twilio)
- [ ] Booking confirmation email
- [ ] Booking reminder SMS

---

### Phase 7: Advanced Features

- [ ] Reviews & ratings system
- [ ] Promo codes/discounts
- [ ] Loyalty program
- [ ] Calendar view
- [ ] Multi-language (i18n)
- [ ] Dark mode

---

### Phase 8: Performance & SEO

- [ ] Image optimization
- [ ] Code splitting
- [ ] SSR optimization
- [ ] Meta tags for SEO
- [ ] Sitemap generation
- [ ] Google Analytics
- [ ] Lighthouse optimization

---

### Phase 9: Testing

- [ ] Unit tests (Jest)
- [ ] Integration tests
- [ ] E2E tests (Playwright)
- [ ] Performance testing
- [ ] Mobile testing

---

### Phase 10: Deployment

- [ ] Setup Vercel project
- [ ] Configure MongoDB Atlas (production)
- [ ] Environment variables setup
- [ ] Domain configuration
- [ ] SSL certificate
- [ ] Deploy to production

---

## 📝 NOTES

### Current Status
- ✅ Database structure: **COMPLETE**
- ✅ UI Components: **COMPLETE** (with mock data)
- ⏳ API Routes: **NOT STARTED**
- ⏳ Real data integration: **NOT STARTED**
- ⏳ Payment: **NOT STARTED**
- ⏳ Authentication: **NOT STARTED**

### Priority Order
1. **HIGH:** API Routes + UI Migration
2. **HIGH:** Booking System + Conflict Detection
3. **MEDIUM:** Payment Integration
4. **MEDIUM:** Notifications
5. **LOW:** Authentication
6. **LOW:** Advanced Features

### Estimated Timeline
- Phase 1-2: **1-2 weeks** (API + UI Migration)
- Phase 3: **3-5 days** (Booking System)
- Phase 4: **1 week** (Payment)
- Phase 5-7: **2-3 weeks** (Auth + Features)
- Phase 8-10: **1-2 weeks** (Testing + Deploy)

**Total: ~6-8 weeks** for full production-ready system

---

## 🎯 TODAY'S TASK

Hôm nay (October 15, 2025) đã hoàn thành:
- ✅ Thiết kế database schema
- ✅ Tạo 7 Mongoose models
- ✅ Setup MongoDB connection
- ✅ Viết seed script
- ✅ Viết documentation

**Nhiệm vụ tiếp theo (Ngày mai):**
1. [ ] Chạy `pnpm db:seed` để seed data
2. [ ] Verify data trong MongoDB Compass
3. [ ] Bắt đầu tạo API routes cho Cities
4. [ ] Test API với Thunder Client/Postman

---

**Last Updated:** October 15, 2025
**Status:** Database Setup Complete ✅
**Next Phase:** API Development 🚀
