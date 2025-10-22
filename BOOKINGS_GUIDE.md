# 📅 Bookings Guide - Hướng dẫn quản lý đặt phòng

## 📊 Sample Bookings Overview

Sau khi chạy `pnpm db:seed`, hệ thống sẽ tạo **13 bookings mẫu**:

### 🗓️ Hôm nay: 5 bookings
```
📍 Cinema Room 00 | 14:00-18:00 | Confirmed ✅ | Paid ✅
📍 Cinema Room 01 | 16:00-20:00 | Confirmed ✅ | Paid ✅
📍 Cinema Room 02 | 18:00-22:00 | Checked-in 🟢 | Unpaid ⏳
📍 Cinema Room 03 | 20:00-00:00 | Checked-in 🟢 | Unpaid ⏳
📍 Cinema Room 04 | 22:00-02:00 | Pending ⏳ | Unpaid ⏳
```

### 📅 Ngày mai: 8 bookings
```
📍 Cinema Room 02-07 | 10:00-22:00 | All Confirmed ✅ | All Paid ✅
```

---

## 🎯 Booking Status Flow

```
pending → confirmed → checked-in → checked-out
   ↓
cancelled
```

### Status Definitions:
- **pending** 🟡 - Chờ xác nhận
- **confirmed** ✅ - Đã xác nhận
- **checked-in** 🟢 - Đang sử dụng phòng
- **checked-out** ⚫ - Đã trả phòng
- **cancelled** ❌ - Đã hủy

---

## 💰 Payment Status

- **unpaid** ⏳ - Chưa thanh toán
- **paid** ✅ - Đã thanh toán
- **refunded** 💵 - Đã hoàn tiền

### Payment Methods:
- `ewallet` - Ví điện tử (MoMo, ZaloPay)
- `bank` - Chuyển khoản ngân hàng
- `card` - Thẻ tín dụng/ghi nợ
- `cash` - Tiền mặt

---

## 📋 Booking Data Structure

```typescript
{
  bookingCode: "BK20251016001",      // Mã đặt phòng
  roomId: ObjectId,                   // ID phòng
  branchId: ObjectId,                 // ID chi nhánh
  
  customerInfo: {
    name: "Nguyễn Văn A",
    phone: "0989760000",
    email: "customer@example.com"
  },
  
  bookingDate: Date,                  // Ngày đặt (ngày trong lịch)
  startTime: Date,                    // Giờ bắt đầu
  endTime: Date,                      // Giờ kết thúc
  duration: 4,                        // Số giờ (4h)
  
  comboPackageId: ObjectId,           // ID combo (optional)
  roomPrice: 239000,                  // Giá phòng
  
  menuItems: [
    {
      menuItemId: ObjectId,
      name: "NƯỚC NGỌT",
      price: 20000,
      quantity: 2,
      subtotal: 40000
    }
  ],
  
  pricing: {
    roomTotal: 239000,                // Tổng tiền phòng
    menuTotal: 40000,                 // Tổng tiền menu
    subtotal: 279000,                 // Tổng cộng
    tax: 27900,                       // Thuế (10%)
    discount: 0,                      // Giảm giá
    total: 306900                     // Tổng cuối
  },
  
  status: "confirmed",
  paymentStatus: "paid",
  paymentMethod: "ewallet",
  notes: "Booking mẫu"
}
```

---

## 🔍 Query Bookings API

### Get bookings by room and date
```bash
GET /api/bookings?roomId=xxx&date=2025-10-16
```

### Get bookings by branch
```bash
GET /api/bookings?branchId=xxx
```

### Get all bookings today
```bash
GET /api/bookings?date=2025-10-16
```

**Response:**
```json
{
  "success": true,
  "data": [...],
  "count": 13,
  "filters": {
    "roomId": "xxx",
    "date": "2025-10-16"
  }
}
```

---

## 🎨 Timeline Visualization

Timeline component sẽ hiển thị bookings theo giờ:

```
06:00 ░░░░░░░░░░░░░░░░░░░░ Available
08:00 ░░░░░░░░░░░░░░░░░░░░
10:00 ████████████████████ Booking #1
12:00 ████████████████████
14:00 ░░░░░░░░░░░░░░░░░░░░ Available
16:00 ████████████████████ Booking #2
18:00 ████████████████████
20:00 ░░░░░░░░░░░░░░░░░░░░ Available
22:00 ░░░░░░░░░░░░░░░░░░░░
```

### Color Coding:
- 🟢 **Available** - Có thể đặt
- 🔴 **Booked** - Đã có người đặt
- 🟡 **Pending** - Chờ xác nhận
- 🟠 **Checked-in** - Đang sử dụng

---

## ✍️ Create New Booking

### API Endpoint:
```bash
POST /api/bookings
```

### Payload:
```json
{
  "roomId": "6720...",
  "startTime": "2025-10-16T14:00:00.000Z",
  "endTime": "2025-10-16T18:00:00.000Z",
  "customerInfo": {
    "name": "Nguyễn Văn A",
    "phone": "0989760000",
    "email": "customer@example.com"
  },
  "services": {
    "comboPackageId": "6720...",
    "menuItems": [
      {
        "menuItemId": "6720...",
        "quantity": 2
      }
    ]
  },
  "totalPrice": 306900,
  "status": "pending"
}
```

### Response:
```json
{
  "success": true,
  "data": {
    "_id": "6720...",
    "bookingCode": "BK20251016014",
    ...
  },
  "message": "Booking created successfully"
}
```

---

## 🚫 Conflict Detection

Hệ thống sẽ kiểm tra xem có booking nào trùng thời gian không:

```typescript
// Check conflict
const existingBookings = await Booking.find({
  roomId: roomId,
  bookingDate: date,
  status: { $nin: ['cancelled'] },
  $or: [
    {
      startTime: { $lt: endTime },
      endTime: { $gt: startTime }
    }
  ]
})

if (existingBookings.length > 0) {
  return { error: 'Room already booked for this time slot' }
}
```

---

## 📊 Admin Dashboard Queries

### Today's bookings
```javascript
db.bookings.find({
  bookingDate: {
    $gte: ISODate("2025-10-16T00:00:00Z"),
    $lt: ISODate("2025-10-17T00:00:00Z")
  }
}).sort({ startTime: 1 })
```

### Revenue today
```javascript
db.bookings.aggregate([
  {
    $match: {
      bookingDate: {
        $gte: ISODate("2025-10-16T00:00:00Z"),
        $lt: ISODate("2025-10-17T00:00:00Z")
      },
      paymentStatus: 'paid'
    }
  },
  {
    $group: {
      _id: null,
      totalRevenue: { $sum: "$pricing.total" },
      count: { $sum: 1 }
    }
  }
])
```

### Popular rooms
```javascript
db.bookings.aggregate([
  {
    $group: {
      _id: "$roomId",
      bookingCount: { $sum: 1 }
    }
  },
  { $sort: { bookingCount: -1 } },
  { $limit: 10 }
])
```

---

## 🧪 Testing Bookings

### Via MongoDB Compass
1. Connect to `mongodb://localhost:27017`
2. Open database `chill-cine-hotel`
3. Browse collection `bookings`
4. View sample data

### Via mongosh
```javascript
use chill-cine-hotel

// Count bookings
db.bookings.countDocuments()

// View today's bookings
db.bookings.find({
  bookingDate: { $gte: new Date().setHours(0,0,0,0) }
}).pretty()

// View by status
db.bookings.find({ status: 'confirmed' }).pretty()

// View paid bookings
db.bookings.find({ paymentStatus: 'paid' }).pretty()
```

### Via API
```bash
# Get all bookings
curl http://localhost:3000/api/bookings

# Get bookings today
curl http://localhost:3000/api/bookings?date=2025-10-16

# Get bookings by room
curl http://localhost:3000/api/bookings?roomId=6720...
```

---

## 🎯 Booking Code Format

```
BK + YYYYMMDD + Sequential Number

Examples:
- BK20251016001 - First booking on Oct 16, 2025
- BK20251016002 - Second booking on Oct 16, 2025
- BK20251017001 - First booking on Oct 17, 2025
```

---

## 💡 Business Logic

### Minimum Duration
- Tối thiểu: **2 giờ** (COMBO 2H)

### Maximum Duration
- Tối đa: **22 giờ** (COMBO NGÀY)

### Extra Hours Fee
- Vượt quá combo: **50,000đ/giờ**

### Cancellation Policy
- Trước 24h: Hoàn 100%
- Trước 12h: Hoàn 50%
- Trước 6h: Hoàn 25%
- Dưới 6h: Không hoàn

---

## 📱 Customer Journey

```
1. Select City & Branch
   ↓
2. View Available Rooms
   ↓
3. Click "Đặt phòng"
   ↓
4. View Timeline (see booked slots)
   ↓
5. Select Available Time
   ↓
6. Fill Booking Form
   - Customer info
   - Select combo
   - Add menu items
   ↓
7. Review Total Price
   ↓
8. Submit → Create Booking
   ↓
9. Redirect to Payment
   ↓
10. Pay & Receive Booking Code
```

---

## 🔔 Notifications (Future)

### Email
- ✉️ Booking confirmation
- ✉️ Payment receipt
- ✉️ Check-in reminder (1h before)
- ✉️ Thank you & review request

### SMS
- 📱 Booking code
- 📱 Payment confirmation
- 📱 Check-in reminder

---

## 📈 Analytics Queries

### Booking rate by hour
```javascript
db.bookings.aggregate([
  {
    $project: {
      hour: { $hour: "$startTime" }
    }
  },
  {
    $group: {
      _id: "$hour",
      count: { $sum: 1 }
    }
  },
  { $sort: { _id: 1 } }
])
```

### Average booking value
```javascript
db.bookings.aggregate([
  {
    $group: {
      _id: null,
      avgTotal: { $avg: "$pricing.total" }
    }
  }
])
```

### Combo package popularity
```javascript
db.bookings.aggregate([
  {
    $group: {
      _id: "$comboPackageId",
      count: { $sum: 1 }
    }
  },
  {
    $lookup: {
      from: "combopackages",
      localField: "_id",
      foreignField: "_id",
      as: "combo"
    }
  },
  { $sort: { count: -1 } }
])
```

---

## 🎉 Summary

Sau khi seed database:
- ✅ **13 bookings** được tạo tự động
- ✅ **5 bookings hôm nay** với status khác nhau
- ✅ **8 bookings ngày mai** đã confirmed
- ✅ Timeline sẽ hiển thị các slot đã đặt
- ✅ Admin có thể xem overview
- ✅ Customer có thể book slot trống

**Happy Booking! 🎬🍿**
