# 📊 Database Schema - Chill Cine Hotel

## 🏗️ Entity Relationship Diagram

```
┌─────────────────────┐
│      CITIES         │
├─────────────────────┤
│ _id: ObjectId  (PK) │
│ code: string        │
│ name: string        │
│ slug: string        │
│ isActive: boolean   │
│ displayOrder: int   │
│ createdAt: Date     │
│ updatedAt: Date     │
└─────────────────────┘
         │
         │ 1:N
         ▼
┌─────────────────────┐
│     BRANCHES        │
├─────────────────────┤
│ _id: ObjectId  (PK) │
│ cityId: ObjectId(FK)│◄─┐
│ name: string        │  │
│ slug: string        │  │
│ address: string     │  │
│ phone: string       │  │
│ location: {lat,lng} │  │
│ images: [string]    │  │
│ openingHours: {}    │  │
│ amenities: [string] │  │
│ isActive: boolean   │  │
│ createdAt: Date     │  │
│ updatedAt: Date     │  │
└─────────────────────┘  │
         │               │
         │ 1:N           │
         ▼               │
┌─────────────────────┐  │
│      ROOMS          │  │
├─────────────────────┤  │
│ _id: ObjectId  (PK) │  │
│ branchId: ObjId(FK) │──┘
│ roomTypeId: ObjId   │◄────┐
│ name: string        │     │
│ code: string        │     │
│ capacity: int       │     │
│ pricePerHour: int   │     │
│ images: [string]    │     │
│ amenities: [string] │     │
│ description: string │     │
│ status: enum        │     │
│ isActive: boolean   │     │
│ createdAt: Date     │     │
│ updatedAt: Date     │     │
└─────────────────────┘     │
         │                  │
         │ 1:N              │
         ▼                  │
┌─────────────────────┐     │
│     BOOKINGS        │     │
├─────────────────────┤     │
│ _id: ObjectId  (PK) │     │
│ bookingCode: string │     │
│ roomId: ObjId  (FK) │     │
│ branchId: ObjId(FK) │     │
│ customerId: ObjId   │     │
│ customerInfo: {     │     │
│   name: string      │     │
│   phone: string     │     │
│   email: string     │     │
│ }                   │     │
│ bookingDate: Date   │     │
│ startTime: Date     │     │
│ endTime: Date       │     │
│ duration: int       │     │
│ comboPackageId: FK  │◄────┼─┐
│ roomPrice: int      │     │ │
│ menuItems: [{       │     │ │
│   menuItemId: FK    │◄────┼─┼─┐
│   name: string      │     │ │ │
│   price: int        │     │ │ │
│   quantity: int     │     │ │ │
│   subtotal: int     │     │ │ │
│ }]                  │     │ │ │
│ pricing: {          │     │ │ │
│   roomTotal: int    │     │ │ │
│   menuTotal: int    │     │ │ │
│   subtotal: int     │     │ │ │
│   tax: int          │     │ │ │
│   discount: int     │     │ │ │
│   total: int        │     │ │ │
│ }                   │     │ │ │
│ status: enum        │     │ │ │
│ paymentStatus: enum │     │ │ │
│ paymentMethod: enum │     │ │ │
│ notes: string       │     │ │ │
│ checkInTime: Date   │     │ │ │
│ checkOutTime: Date  │     │ │ │
│ cancelledAt: Date   │     │ │ │
│ cancelReason: string│     │ │ │
│ createdAt: Date     │     │ │ │
│ updatedAt: Date     │     │ │ │
└─────────────────────┘     │ │ │
                            │ │ │
┌─────────────────────┐     │ │ │
│    ROOM TYPES       │     │ │ │
├─────────────────────┤     │ │ │
│ _id: ObjectId  (PK) │─────┘ │ │
│ name: string        │       │ │
│ slug: string        │       │ │
│ description: string │       │ │
│ features: [string]  │       │ │
│ color: string       │       │ │
│ displayOrder: int   │       │ │
│ isActive: boolean   │       │ │
│ createdAt: Date     │       │ │
│ updatedAt: Date     │       │ │
└─────────────────────┘       │ │
                              │ │
┌─────────────────────┐       │ │
│  COMBO PACKAGES     │       │ │
├─────────────────────┤       │ │
│ _id: ObjectId  (PK) │───────┘ │
│ name: string        │         │
│ code: string        │         │
│ duration: int       │         │
│ price: int          │         │
│ description: string │         │
│ isSpecial: boolean  │         │
│ timeRange: {}       │         │
│ extraFeePerHour: int│         │
│ isActive: boolean   │         │
│ displayOrder: int   │         │
│ createdAt: Date     │         │
│ updatedAt: Date     │         │
└─────────────────────┘         │
                                │
┌─────────────────────┐         │
│    MENU ITEMS       │         │
├─────────────────────┤         │
│ _id: ObjectId  (PK) │─────────┘
│ name: string        │
│ price: int          │
│ category: enum      │
│ image: string       │
│ description: string │
│ isAvailable: bool   │
│ displayOrder: int   │
│ createdAt: Date     │
│ updatedAt: Date     │
└─────────────────────┘
```

## 📐 Phân cấp địa lý

```
CITY (Tỉnh/Thành)
  └── BRANCH (Chi nhánh)
        └── ROOM (Phòng)
              └── BOOKING (Đặt phòng)
```

## 🏷️ Room Types Hierarchy

```
ROOM TYPES
├── Classic   (Phòng tiêu chuẩn)
├── Luxury    (Phòng cao cấp)
└── VIP       (Phòng VIP)
```

## 💰 Pricing Structure

```
BOOKING CALCULATION
├── Option 1: COMBO PACKAGE
│   ├── Fixed price (159K - 499K)
│   ├── Fixed duration
│   └── Extra fee: 50K/hour (nếu vượt)
│
└── Option 2: HOURLY
    ├── Base: Room price × Hours
    └── Add-ons: Menu items

MENU ITEMS (Add-ons)
├── Drinks  : 10K - 20K
├── Food    : 40K
├── Snacks  : 10K
└── Extras  : 15K
```

## 🔐 Indexes (Performance)

```javascript
// Cities
- code: 1 (unique)
- slug: 1 (unique)
- {isActive: 1, displayOrder: 1}

// Branches
- {cityId: 1, isActive: 1}
- slug: 1 (unique)

// Rooms
- {branchId: 1, isActive: 1, status: 1}
- {code: 1, branchId: 1} (unique compound)
- roomTypeId: 1

// Bookings
- bookingCode: 1 (unique)
- {roomId: 1, startTime: 1, endTime: 1}
- {branchId: 1, bookingDate: 1}
- {customerId: 1, createdAt: -1}
- {status: 1, paymentStatus: 1}
- "customerInfo.phone": 1

// RoomTypes
- slug: 1 (unique)
- {isActive: 1, displayOrder: 1}

// ComboPackages
- code: 1 (unique)
- {isActive: 1, displayOrder: 1}

// MenuItems
- {category: 1, isAvailable: 1, displayOrder: 1}
```

## 📊 Sample Data Count

| Collection      | Documents | Note                       |
|-----------------|-----------|----------------------------|
| cities          | 4         | HCM, HN, ĐN, CT           |
| branches        | 7         | 3 HCM, 2 HN, 1 ĐN, 1 CT   |
| roomtypes       | 3         | Classic, Luxury, VIP       |
| rooms           | 28        | 4 phòng × 7 chi nhánh     |
| combopackages   | 6         | 2H, 4H, 6H, 10H, Đêm, Ngày|
| menuitems       | 5         | Theo ảnh concept          |
| bookings        | 0+        | Tăng khi user đặt phòng   |

## 🔄 Booking Status Flow

```
[Pending] → [Confirmed] → [Checked-in] → [Checked-out]
    ↓
[Cancelled]
```

## 💳 Payment Status Flow

```
[Unpaid] → [Paid]
              ↓
          [Refunded]
```

---

**Last Updated:** October 15, 2025
