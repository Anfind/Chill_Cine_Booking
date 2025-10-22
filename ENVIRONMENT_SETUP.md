# 🔧 Environment Setup Guide

## Hướng dẫn cấu hình môi trường cho Chill Cine Booking

---

## 📋 Bước 1: Copy file environment

```bash
# Copy .env.example thành .env.local
cp .env.example .env.local
```

Hoặc trên Windows:
```cmd
copy .env.example .env.local
```

---

## 🗄️ Bước 2: Cấu hình MongoDB

### Option 1: MongoDB Local

**Windows:**
```cmd
# Cài đặt MongoDB Community Server từ:
https://www.mongodb.com/try/download/community

# Khởi động MongoDB service
net start MongoDB

# Kiểm tra kết nối
mongosh
```

**macOS:**
```bash
# Cài đặt qua Homebrew
brew install mongodb-community@7.0

# Khởi động service
brew services start mongodb-community@7.0

# Kiểm tra
mongosh
```

**Linux:**
```bash
# Cài đặt MongoDB 7.0
sudo apt-get install mongodb-org

# Khởi động
sudo systemctl start mongod

# Kiểm tra
mongosh
```

### Option 2: MongoDB Docker

```bash
# Chạy MongoDB container
docker run -d \
  --name mongodb \
  -p 27017:27017 \
  -v mongodb_data:/data/db \
  mongo:7.0

# Kiểm tra container đang chạy
docker ps

# Connect vào MongoDB
docker exec -it mongodb mongosh
```

### Option 3: MongoDB Atlas (Cloud)

1. Đăng ký tại: https://www.mongodb.com/cloud/atlas
2. Tạo free cluster (M0)
3. Lấy connection string
4. Update `MONGODB_URI` trong `.env.local`:

```env
MONGODB_URI=mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/chill-cine-hotel?retryWrites=true&w=majority
```

---

## 🌱 Bước 3: Seed Database

```bash
# Cài đặt dependencies
pnpm install

# Chạy seed script
pnpm db:seed
```

**Kết quả mong đợi:**
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
```

---

## 🔐 Bước 4: Cấu hình Authentication (Optional)

### NextAuth Secret

Generate một secret key mới:

```bash
# Dùng openssl
openssl rand -base64 32

# Hoặc dùng Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

Copy kết quả vào `.env.local`:
```env
NEXTAUTH_SECRET=your-generated-secret-here
```

---

## 💳 Bước 5: Payment Gateway (Optional - Phase 3)

### VNPay (Sandbox)

1. Đăng ký sandbox: https://sandbox.vnpayment.vn
2. Lấy credentials
3. Update `.env.local`:

```env
VNPAY_TMN_CODE=your_tmn_code
VNPAY_HASH_SECRET=your_hash_secret
```

### MoMo (Test)

1. Đăng ký test: https://developers.momo.vn
2. Lấy Partner Code, Access Key, Secret Key
3. Update `.env.local`

### ZaloPay (Sandbox)

1. Đăng ký sandbox: https://docs.zalopay.vn
2. Lấy App ID, Key1, Key2
3. Update `.env.local`

---

## 📧 Bước 6: Email Service (Optional - Phase 3)

### Resend (Recommended)

1. Đăng ký: https://resend.com
2. Tạo API Key
3. Update `.env.local`:

```env
RESEND_API_KEY=re_xxxxxxxxxxxxx
```

---

## 📱 Bước 7: SMS Service (Optional - Phase 3)

### Twilio

1. Đăng ký: https://www.twilio.com
2. Lấy Account SID, Auth Token, Phone Number
3. Update `.env.local`:

```env
TWILIO_ACCOUNT_SID=ACxxxxxxxxxx
TWILIO_AUTH_TOKEN=your_auth_token
TWILIO_PHONE_NUMBER=+1234567890
```

---

## ☁️ Bước 8: Cloud Storage (Optional - Phase 4)

### Cloudinary

1. Đăng ký: https://cloudinary.com
2. Lấy Cloud Name, API Key, API Secret
3. Update `.env.local`:

```env
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

---

## ✅ Bước 9: Kiểm tra cấu hình

### Chạy development server

```bash
pnpm dev
```

Mở trình duyệt tại: http://localhost:3000

### Test các endpoints

```bash
# Test cities
curl http://localhost:3000/api/cities

# Test branches
curl http://localhost:3000/api/branches

# Test rooms
curl http://localhost:3000/api/rooms
```

### Kiểm tra MongoDB connection

```bash
# Vào mongosh
mongosh

# Chuyển sang database
use chill-cine-hotel

# Kiểm tra collections
show collections

# Đếm documents
db.cities.countDocuments()      # Phải có 4
db.branches.countDocuments()    # Phải có 7
db.rooms.countDocuments()       # Phải có 28
db.combopackages.countDocuments() # Phải có 6
db.menuitems.countDocuments()   # Phải có 5
```

---

## 🎯 Environment Variables Summary

### Required (Bắt buộc)
- ✅ `MONGODB_URI` - MongoDB connection string
- ✅ `NEXT_PUBLIC_APP_URL` - App URL
- ✅ `NEXT_PUBLIC_HOTLINE` - Số hotline

### Optional (Tùy chọn - cho các phase sau)
- ⏳ `NEXTAUTH_SECRET` - Auth secret key
- ⏳ `VNPAY_*` - VNPay payment credentials
- ⏳ `MOMO_*` - MoMo payment credentials
- ⏳ `ZALOPAY_*` - ZaloPay payment credentials
- ⏳ `RESEND_API_KEY` - Email service
- ⏳ `TWILIO_*` - SMS service
- ⏳ `CLOUDINARY_*` - Cloud storage

---

## 🚨 Troubleshooting

### MongoDB connection failed

**Lỗi:**
```
MongooseServerSelectionError: connect ECONNREFUSED 127.0.0.1:27017
```

**Giải pháp:**
```bash
# Kiểm tra MongoDB đang chạy
# Windows:
net start MongoDB

# macOS/Linux:
sudo systemctl status mongod
```

### Port 3000 đã được sử dụng

**Lỗi:**
```
Port 3000 is already in use
```

**Giải pháp:**
```bash
# Windows - Kill process trên port 3000
netstat -ano | findstr :3000
taskkill /PID <PID> /F

# macOS/Linux
lsof -ti:3000 | xargs kill -9
```

### Seed script failed

**Lỗi:**
```
Error: Cannot find module 'tsx'
```

**Giải pháp:**
```bash
# Cài lại dependencies
pnpm install

# Hoặc cài tsx global
pnpm add -D tsx
```

---

## 📚 Resources

- [Next.js Environment Variables](https://nextjs.org/docs/app/building-your-application/configuring/environment-variables)
- [MongoDB Connection String](https://www.mongodb.com/docs/manual/reference/connection-string/)
- [NextAuth.js Configuration](https://next-auth.js.org/configuration/options)
- [VNPay Documentation](https://sandbox.vnpayment.vn/apis/)
- [Resend Documentation](https://resend.com/docs)

---

## 🎉 Done!

Khi đã setup xong, bạn có thể:
1. ✅ Chạy `pnpm dev`
2. ✅ Mở http://localhost:3000
3. ✅ Test booking flow
4. ✅ Vào admin tại http://localhost:3000/admin

**Happy Coding! 🚀**
