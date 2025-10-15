# 🗄️ Hướng dẫn Setup Database MongoDB Local

## 📋 Yêu cầu

- **MongoDB Community Server** 6.0+ hoặc 7.0+
- **Node.js** 18+
- **pnpm** (đã cài)

---

## 🚀 Cài đặt MongoDB trên Windows

### Cách 1: Cài đặt MongoDB Community Server (Khuyến nghị)

1. **Download MongoDB**
   - Truy cập: https://www.mongodb.com/try/download/community
   - Chọn version: **7.0.x** (Current)
   - Platform: **Windows x64**
   - Package: **MSI**

2. **Cài đặt**
   - Chạy file `.msi` đã download
   - Chọn **Complete** installation
   - Tick chọn **"Install MongoDB as a Service"**
   - Tick chọn **"Install MongoDB Compass"** (GUI tool)

3. **Kiểm tra MongoDB đã chạy**
   ```cmd
   mongod --version
   ```

4. **Khởi động MongoDB Service**
   ```cmd
   net start MongoDB
   ```

5. **Kiểm tra kết nối**
   ```cmd
   mongosh
   ```

### Cách 2: Dùng Docker (Nếu có Docker Desktop)

```bash
docker run -d -p 27017:27017 --name mongodb mongo:7.0
```

---

## 🔧 Cấu hình Project

### 1. File `.env.local` đã có sẵn với:

```env
MONGODB_URI=mongodb://localhost:27017/chill-cine-hotel
```

### 2. Kiểm tra connection

Tạo file test: `test-connection.js`

```javascript
const { MongoClient } = require('mongodb');

async function test() {
  const client = new MongoClient('mongodb://localhost:27017');
  try {
    await client.connect();
    console.log('✅ Connected to MongoDB!');
    await client.db('admin').command({ ping: 1 });
    console.log('✅ Ping successful!');
  } catch (e) {
    console.error('❌ Connection failed:', e);
  } finally {
    await client.close();
  }
}

test();
```

Chạy: `node test-connection.js`

---

## 🌱 Seed Database

### 1. Chạy lệnh seed

```bash
pnpm db:seed
```

Lệnh này sẽ:
- ✅ Xóa dữ liệu cũ (nếu có)
- ✅ Tạo 4 Cities (HCM, HN, ĐN, CT)
- ✅ Tạo 7 Branches
- ✅ Tạo 3 Room Types (Classic, Luxury, VIP)
- ✅ Tạo 28 Rooms (4 phòng/chi nhánh)
- ✅ Tạo 6 Combo Packages
- ✅ Tạo 5 Menu Items

### 2. Kết quả mong đợi

```
🌱 Starting database seeding...
✅ Cleared existing data
✅ Created 4 cities
✅ Created 7 branches
✅ Created 3 room types
✅ Created 28 rooms
✅ Created 6 combo packages
✅ Created 5 menu items

🎉 Database seeded successfully!
📊 Summary:
   - Cities: 4
   - Branches: 7
   - Room Types: 3
   - Rooms: 28
   - Combo Packages: 6
   - Menu Items: 5
```

---

## 🗂️ Cấu trúc Database

### Collections

```
chill-cine-hotel
├── cities           (4 documents)
├── branches         (7 documents)
├── roomtypes        (3 documents)
├── rooms            (28 documents)
├── combopackages    (6 documents)
├── menuitems        (5 documents)
└── bookings         (0 documents - sẽ tạo khi user đặt phòng)
```

### Quan hệ

```
Cities (1) ──< Branches (many)
Branches (1) ──< Rooms (many)
RoomTypes (1) ──< Rooms (many)
Rooms (1) ──< Bookings (many)
ComboPackages (1) ──< Bookings (many)
MenuItems (many) >──< Bookings (many)
```

---

## 🔍 Xem dữ liệu bằng MongoDB Compass

1. Mở **MongoDB Compass**
2. Connection string: `mongodb://localhost:27017`
3. Click **Connect**
4. Chọn database: **chill-cine-hotel**
5. Xem các collections

---

## 📊 Sample Queries (mongosh)

### Xem tất cả cities

```javascript
use chill-cine-hotel
db.cities.find().pretty()
```

### Xem branches của HCM

```javascript
db.branches.find({ cityId: ObjectId("...") }).pretty()
```

### Xem rooms của một branch

```javascript
db.rooms.find({ branchId: ObjectId("...") }).pretty()
```

### Đếm số phòng theo loại

```javascript
db.rooms.aggregate([
  { $group: { _id: "$roomTypeId", count: { $sum: 1 } } }
])
```

### Xem combo packages

```javascript
db.combopackages.find().sort({ displayOrder: 1 })
```

---

## 🛠️ Troubleshooting

### Lỗi: "MongoServerError: connect ECONNREFUSED"

**Nguyên nhân:** MongoDB service chưa chạy

**Giải pháp:**
```cmd
net start MongoDB
```

### Lỗi: "MongooseServerSelectionError"

**Nguyên nhân:** Connection string sai hoặc MongoDB chưa khởi động

**Giải pháp:**
1. Kiểm tra MongoDB đang chạy: `mongosh`
2. Kiểm tra `.env.local` có đúng connection string

### Lỗi: Port 27017 đã được dùng

**Giải pháp:**
```cmd
# Tìm process đang dùng port
netstat -ano | findstr :27017

# Kill process
taskkill /PID <PID> /F
```

---

## 📱 Mobile-First Design Notes

Database đã được thiết kế tối ưu cho mobile:

- ✅ **Images array** - Support slideshow cho từng phòng
- ✅ **Combo packages** - Giá cố định dễ tính toán
- ✅ **Menu items** - Danh sách ngắn gọn, rõ ràng
- ✅ **Phone-first booking** - Không bắt buộc login
- ✅ **Indexes** - Query nhanh cho mobile 3G/4G

---

## 🎯 Next Steps

Sau khi seed database thành công, bạn có thể:

1. ✅ Tạo API routes để fetch data từ MongoDB
2. ✅ Migrate UI components để dùng real data
3. ✅ Implement booking logic với database
4. ✅ Add real-time availability checking
5. ✅ Implement payment integration

---

## 📞 Support

Nếu gặp vấn đề, liên hệ:
- Hotline: **0989.76.0000**
- Email: support@chillcine.com

---

**Created:** October 15, 2025
**Database Version:** 1.0.0
**MongoDB Version:** 7.0+
