# 🎬 Chill Cine Hotel - System Architecture

## 🏗️ High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         USERS (Mobile)                          │
│                    📱 iPhone/Android Browsers                    │
└─────────────────────────────────────────────────────────────────┘
                              │
                              │ HTTPS
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                      NEXT.JS 15 APP                             │
│                     (App Router + RSC)                          │
├─────────────────────────────────────────────────────────────────┤
│  PAGES                    │  COMPONENTS      │  API ROUTES      │
│  ├─ Homepage              │  ├─ UI Library   │  ├─ /api/cities  │
│  ├─ Rooms List            │  ├─ Forms        │  ├─ /api/branches│
│  ├─ Booking               │  ├─ Timeline     │  ├─ /api/rooms   │
│  ├─ Payment               │  └─ Admin        │  ├─ /api/bookings│
│  └─ Admin Dashboard       │                  │  └─ /api/payment │
└─────────────────────────────────────────────────────────────────┘
                              │
                              │ Mongoose ODM
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                      MONGODB DATABASE                            │
│                      (Local / Atlas)                             │
├─────────────────────────────────────────────────────────────────┤
│  COLLECTIONS:                                                    │
│  ├─ cities (4)           Tỉnh/Thành phố                         │
│  ├─ branches (7)         Chi nhánh                               │
│  ├─ roomtypes (3)        Loại phòng                             │
│  ├─ rooms (28)           Phòng cinema                            │
│  ├─ combopackages (6)    Gói combo giá                          │
│  ├─ menuitems (5)        Menu đồ ăn/uống                        │
│  └─ bookings (0+)        Đặt phòng                               │
└─────────────────────────────────────────────────────────────────┘
                              │
                              │ (Future)
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                    EXTERNAL SERVICES                             │
├─────────────────────────────────────────────────────────────────┤
│  ├─ Payment Gateway (VNPay, MoMo, ZaloPay)                      │
│  ├─ SMS Service (Twilio)                                        │
│  ├─ Email Service (Resend/SendGrid)                             │
│  └─ Cloud Storage (Cloudinary/AWS S3)                           │
└─────────────────────────────────────────────────────────────────┘
```

---

## 📊 Data Flow - User Booking Process

```
┌─────────────┐
│   USER      │
│  (Mobile)   │
└──────┬──────┘
       │
       │ 1. Visit homepage
       ▼
┌─────────────────────────────┐
│  HOMEPAGE                   │
│  ┌──────────────────────┐   │
│  │ Location Selector    │   │
│  │ - Chọn Tỉnh/Thành   │   │
│  │ - Chọn Chi nhánh     │   │
│  └──────────────────────┘   │
└──────┬──────────────────────┘
       │ 2. Select branch
       │ GET /api/branches?cityId=xxx
       ▼
┌─────────────────────────────┐
│  ROOMS LIST PAGE            │
│  ┌──────────────────────┐   │
│  │ Room Cards           │   │
│  │ - Hình ảnh           │   │
│  │ - Giá/giờ            │   │
│  │ - Capacity           │   │
│  │ - Tiện ích           │   │
│  └──────────────────────┘   │
└──────┬──────────────────────┘
       │ 3. Select room
       │ GET /api/rooms/[id]
       │ GET /api/bookings?roomId=xxx&date=xxx
       ▼
┌─────────────────────────────┐
│  BOOKING PAGE               │
│  ┌──────────────────────┐   │
│  │ Timeline Booking     │   │
│  │ - Xem lịch đặt       │   │
│  │ - Chọn giờ trống     │   │
│  └──────────────────────┘   │
│  ┌──────────────────────┐   │
│  │ Booking Form         │   │
│  │ - Chọn combo/giờ     │   │
│  │ - Thêm menu items    │   │
│  │ - Nhập thông tin     │   │
│  └──────────────────────┘   │
└──────┬──────────────────────┘
       │ 4. Submit booking
       │ POST /api/bookings
       │ {
       │   roomId, startTime, endTime,
       │   customerInfo, menuItems, ...
       │ }
       ▼
┌─────────────────────────────┐
│  PAYMENT PAGE               │
│  ┌──────────────────────┐   │
│  │ Booking Summary      │   │
│  │ - Tổng tiền          │   │
│  │ - Chọn PT thanh toán │   │
│  └──────────────────────┘   │
└──────┬──────────────────────┘
       │ 5. Payment
       │ POST /api/payment
       ▼
┌─────────────────────────────┐
│  PAYMENT GATEWAY            │
│  (VNPay/MoMo/ZaloPay)       │
└──────┬──────────────────────┘
       │ 6. Callback
       │ payment_status=success
       ▼
┌─────────────────────────────┐
│  SUCCESS PAGE               │
│  ┌──────────────────────┐   │
│  │ Booking Confirmed    │   │
│  │ - Mã đặt phòng       │   │
│  │ - Thông tin chi tiết │   │
│  └──────────────────────┘   │
└─────────────────────────────┘
       │
       │ 7. Send notifications
       ▼
┌─────────────────────────────┐
│  EMAIL / SMS                │
│  - Xác nhận booking         │
│  - Booking code             │
│  - Chi tiết phòng           │
└─────────────────────────────┘
```

---

## 🗄️ Database Relationships

```
          ┌─────────┐
          │ CITIES  │
          │ (4)     │
          └────┬────┘
               │ 1:N
               ▼
          ┌─────────┐
          │BRANCHES │
          │ (7)     │
          └────┬────┘
               │ 1:N
               ▼
    ┌──────────────────────┐
    │                      │
    │      ROOMS (28)      │◄────┐
    │                      │     │
    └──────┬───────────────┘     │
           │ 1:N                 │ N:1
           ▼                     │
    ┌──────────────┐      ┌─────┴──────┐
    │   BOOKINGS   │      │ ROOM TYPES │
    │   (0+)       │      │    (3)     │
    └──────┬───────┘      └────────────┘
           │
           ├───────┐
           │       │
           │ N:1   │ N:1
           ▼       ▼
    ┌──────────┐ ┌───────────┐
    │  COMBO   │ │   MENU    │
    │ PACKAGES │ │   ITEMS   │
    │   (6)    │ │    (5)    │
    └──────────┘ └───────────┘
```

---

## 🎯 Component Hierarchy

```
App (Root Layout)
│
├─ Homepage
│  └─ LocationSelector
│     ├─ City Cards
│     └─ Branch Cards
│
├─ Rooms List Page
│  └─ RoomsClient
│     └─ Room Cards
│        ├─ Image
│        ├─ Pricing Badge
│        └─ Amenities
│
├─ Booking Page
│  ├─ TimelineBooking
│  │  ├─ Date Selector
│  │  ├─ Hour Grid
│  │  └─ Booking Blocks
│  │
│  ├─ BookingForm
│  │  ├─ Image Slideshow
│  │  ├─ Combo Selector
│  │  ├─ Time Picker
│  │  ├─ Menu Items
│  │  └─ Customer Info
│  │
│  └─ RoomDetailsPanel
│     ├─ Room Info
│     ├─ Amenities
│     └─ Menu Preview
│
├─ Payment Page
│  ├─ Booking Summary
│  └─ Payment Methods
│     ├─ Card
│     ├─ E-wallet
│     └─ Bank Transfer
│
└─ Admin Dashboard
   ├─ BookingsOverview
   │  ├─ Stats Cards
   │  └─ Recent Bookings
   │
   ├─ BranchesManager
   │  ├─ Branch List
   │  └─ Branch Form Dialog
   │
   └─ RoomsManager
      ├─ Room List
      └─ Room Form Dialog
```

---

## 🔄 Booking State Machine

```
                   ┌──────────┐
                   │  START   │
                   └────┬─────┘
                        │
                        ▼
                   ┌──────────┐
      ┌────────────│ PENDING  │
      │            └────┬─────┘
      │                 │
      │                 │ Payment Success
      │                 ▼
      │            ┌──────────┐
      │            │CONFIRMED │
      │            └────┬─────┘
      │                 │
      │                 │ Check-in
      │                 ▼
      │            ┌──────────┐
      │            │CHECKED-IN│
      │            └────┬─────┘
      │                 │
      │                 │ Check-out
      │                 ▼
      │            ┌──────────┐
      │            │CHECKED   │
      │            │   OUT    │
      │            └──────────┘
      │
      │ Cancel
      ▼
┌──────────┐
│CANCELLED │
└──────────┘
```

---

## 💰 Price Calculation Logic

```
┌─────────────────────────────────────┐
│       BOOKING CALCULATION           │
└─────────────────────────────────────┘
              │
              │
        ┌─────┴─────┐
        │           │
        ▼           ▼
   ┌─────────┐  ┌─────────┐
   │ COMBO?  │  │ HOURLY? │
   └────┬────┘  └────┬────┘
        │            │
        │YES         │YES
        ▼            ▼
   ┌─────────┐  ┌─────────┐
   │ Fixed   │  │ Room    │
   │ Price   │  │Price ×  │
   │         │  │ Hours   │
   └────┬────┘  └────┬────┘
        │            │
        └──────┬─────┘
               │
               ▼
        ┌──────────────┐
        │ + Menu Items │
        │   (Optional) │
        └──────┬───────┘
               │
               ▼
        ┌──────────────┐
        │ + Tax (VAT)  │
        │   (Optional) │
        └──────┬───────┘
               │
               ▼
        ┌──────────────┐
        │ - Discount   │
        │   (Optional) │
        └──────┬───────┘
               │
               ▼
        ┌──────────────┐
        │  TOTAL PRICE │
        └──────────────┘
```

---

## 🔐 Security Layers

```
┌─────────────────────────────────────┐
│          SECURITY LAYERS            │
├─────────────────────────────────────┤
│ 1. HTTPS/SSL                        │
│    └─ Encrypt data in transit       │
├─────────────────────────────────────┤
│ 2. Environment Variables            │
│    └─ Hide sensitive credentials    │
├─────────────────────────────────────┤
│ 3. Input Validation                 │
│    └─ Zod schema validation         │
├─────────────────────────────────────┤
│ 4. MongoDB Injection Prevention     │
│    └─ Mongoose sanitization         │
├─────────────────────────────────────┤
│ 5. Rate Limiting                    │
│    └─ Prevent API abuse             │
├─────────────────────────────────────┤
│ 6. CORS                             │
│    └─ Control API access            │
├─────────────────────────────────────┤
│ 7. Authentication (Future)          │
│    └─ NextAuth.js JWT tokens        │
└─────────────────────────────────────┘
```

---

## 📱 Mobile-First Responsive Breakpoints

```
                    Mobile           Tablet          Desktop
                    < 640px         640-1024px       > 1024px
                       │                │                │
    ┌──────────────────┼────────────────┼────────────────┤
    │                  │                │                │
    │  Single Column   │  2 Columns     │  3+ Columns    │
    │  Stack Layout    │  Grid Layout   │  Wide Layout   │
    │  Touch UI        │  Touch+Mouse   │  Mouse UI      │
    │  Bottom Nav      │  Bottom Nav    │  Side Nav      │
    │  Large Buttons   │  Medium Btn    │  Normal Btn    │
    │  16px+ Text      │  14px+ Text    │  14px Text     │
    │                  │                │                │
    └──────────────────┴────────────────┴────────────────┘
```

---

**System Architecture v1.0 - October 15, 2025**
