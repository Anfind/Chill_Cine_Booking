# ✅ Cron Job Implementation - Auto-Cancel Expired Bookings

## 📦 Đã Thêm

### 1. Dependencies
- `node-cron@4.2.1` - Thư viện cron job
- `@types/node-cron@3.0.11` - TypeScript types

### 2. Files Created

```
lib/cron/
├── index.ts          # Entry point, auto-initialize cron jobs
├── jobs.ts           # Cron job definitions
├── test.ts           # Test script
└── README.md         # Documentation

app/api/
├── bookings/cleanup/route.ts  # API endpoint để cancel expired bookings
└── cron/status/route.ts       # API endpoint để check cron status
```

### 3. Environment Variables

Added to `.env.local`:
```env
CRON_SECRET=chill-cine-cron-secret-key-2025-very-secure-random-string-change-in-production
```

## 🚀 Cách Hoạt Động

### Flow Tự Động

```
1. Server khởi động
   ↓
2. app/layout.tsx import "@/lib/cron"
   ↓
3. lib/cron/index.ts → initCronJobs()
   ↓
4. lib/cron/jobs.ts → Tạo cron schedule
   ↓
5. MỖI 2 PHÚT: Cron job tự động chạy
   ↓
6. Call API: POST /api/bookings/cleanup
   ↓
7. API tìm bookings:
      - status = 'pending'
      - paymentStatus = 'unpaid'
      - createdAt > 10 phút (dùng createdAt, KHÔNG dùng paymentQRCreatedAt)
   ↓
8. Cancel tất cả bookings expired
   ↓
9. Log kết quả ra console
```

**🔑 Điểm quan trọng:** Dùng `createdAt` thay vì `paymentQRCreatedAt` để:
- ✅ Đảm bảo MỌI booking pending đều bị hủy
- ✅ Tránh lỗ hổng: User tạo booking nhưng không vào payment page
- ✅ `createdAt` luôn tồn tại (Mongoose tự động tạo)

### Timeline

```
T=0:00   User tạo booking
         → status: pending
         → paymentStatus: unpaid
         → paymentQRCreatedAt: 2025-10-22 19:30:00

T=0:01   Timeline hiển thị BOOKING MÀU VÀNG ⚠️
         → Chặn người khác đặt cùng giờ

T=2:00   Cron job chạy lần 1 (2 phút)
         → Elapsed: 2 min → Chưa hủy (< 10 min)

T=4:00   Cron job chạy lần 2 (4 phút)
         → Elapsed: 4 min → Chưa hủy (< 10 min)

T=6:00   Cron job chạy lần 3 (6 phút)
         → Elapsed: 6 min → Chưa hủy (< 10 min)

T=8:00   Cron job chạy lần 4 (8 phút)
         → Elapsed: 8 min → Chưa hủy (< 10 min)

T=10:00  Payment page countdown = 0
         → Hiển thị "Hết thời gian thanh toán"

T=10:01  Cron job chạy lần 5 (10 phút 1 giây)
         → Elapsed: 10.02 min → HỦY ĐƠN! ✅
         → status: cancelled
         → cancelReason: "Auto-cancelled: Payment timeout (10 minutes since booking creation)"
         → cancelledAt: 2025-10-22 19:40:01

T=10:02  Timeline cập nhật
         → Booking màu vàng BIẾN MẤT
         → Slot giờ đó ĐƯỢC GIẢI PHÓNG
         → Người khác có thể đặt lại ✅
```

## 🧪 Testing

### Test 1: Preview (không thực sự hủy)

```bash
curl -X GET http://localhost:3000/api/bookings/cleanup \
  -H "Authorization: Bearer chill-cine-cron-secret-key-2025-very-secure-random-string-change-in-production"
```

Response:
```json
{
  "success": true,
  "preview": true,
  "count": 2,
  "bookings": [
    {
      "bookingCode": "BK001",
      "customerName": "Nguyễn Văn A",
      "createdAt": "2025-10-22T12:20:00.000Z",
      "hadQRCode": true,
      "elapsedMinutes": 12,
      "elapsedSeconds": 720
    }
  ],
  "cutoffTime": "2025-10-22T12:22:00.000Z",
  "currentTime": "2025-10-22T12:32:00.000Z"
}
```

### Test 2: Execute (thực sự hủy)

```bash
curl -X POST http://localhost:3000/api/bookings/cleanup \
  -H "Authorization: Bearer chill-cine-cron-secret-key-2025-very-secure-random-string-change-in-production" \
  -H "Content-Type: application/json"
```

Response:
```json
{
  "success": true,
  "cancelledCount": 2,
  "bookings": [
    {
      "bookingCode": "BK001",
      "bookingId": "507f1f77bcf86cd799439011",
      "customerName": "Nguyễn Văn A",
      "elapsedMinutes": 12,
      "hadQRCode": true
    }
  ],
  "timestamp": "2025-10-22T12:32:00.000Z"
}
```

### Test 3: Check cron status

```bash
curl http://localhost:3000/api/cron/status
```

Response:
```json
{
  "success": true,
  "status": {
    "initialized": true,
    "tasksCount": 1
  },
  "environment": "development",
  "timestamp": "2025-10-22T12:32:00.000Z"
}
```

### Test 4: Run test script

```bash
npx tsx lib/cron/test.ts
```

## 📊 Expected Logs

### Server Startup

```
🚀 Initializing cron jobs...
✅ Cron job initialized: Booking Cleanup (every 2 minutes)
   Pattern: */2 * * * * (every 2 minutes)
   Timezone: Asia/Ho_Chi_Minh (GMT+7)
   Status: Running ✓
✅ Cron jobs initialization completed
```

### Every 2 Minutes (No Expired Bookings)

```
⏰ [19:42:00] Running booking cleanup job...
✅ Cleanup job completed: No expired bookings
```

### Every 2 Minutes (Found Expired Bookings)

```
⏰ [19:42:00] Running booking cleanup job...
🔍 Searching for expired bookings...
📋 Found 2 expired booking(s):
  - BK001 (ID: 507f1f77bcf86cd799439011) {
      createdAt: 2025-10-22T12:30:00.000Z,
      paymentQRCreatedAt: 2025-10-22T12:31:00.000Z (or 'N/A (never visited payment page)'),
      elapsedSeconds: 612,
      room: 507f1f77bcf86cd799439012,
      customer: 'Nguyễn Văn A'
    }
  - BK002 (ID: 507f1f77bcf86cd799439013) {
      createdAt: 2025-10-22T12:28:00.000Z,
      paymentQRCreatedAt: 'N/A (never visited payment page)',
      elapsedSeconds: 732,
      room: 507f1f77bcf86cd799439014,
      customer: 'Trần Thị B'
    }
✅ Successfully cancelled 2 expired booking(s)
✅ Cleanup job completed: 2 booking(s) cancelled
   Cancelled bookings: BK001, BK002
```

## ✅ Verification Checklist

- [x] Package `node-cron` installed
- [x] Package `@types/node-cron` installed
- [x] Cron job file created (`lib/cron/jobs.ts`)
- [x] Cron index file created (`lib/cron/index.ts`)
- [x] Cleanup API created (`app/api/bookings/cleanup/route.ts`)
- [x] Status API created (`app/api/cron/status/route.ts`)
- [x] Cron initialized in `app/layout.tsx`
- [x] Environment variable `CRON_SECRET` added
- [x] Documentation created (`lib/cron/README.md`)
- [x] Test script created (`lib/cron/test.ts`)
- [x] TypeScript errors resolved
- [x] Security: API requires Authorization header
- [x] Timezone set to `Asia/Ho_Chi_Minh`
- [x] Cron pattern: `*/2 * * * *` (every 2 minutes)
- [x] Timeout: 10 minutes (600 seconds)
- [x] Logging comprehensive và clear

## 🔧 Configuration

### Thay Đổi Lịch Chạy

In `lib/cron/jobs.ts`, line 26:

```typescript
// Hiện tại: Mỗi 2 phút
cron.schedule('*/2 * * * *', ...)

// Thay đổi:
cron.schedule('*/5 * * * *', ...)  // Mỗi 5 phút
cron.schedule('*/1 * * * *', ...)  // Mỗi 1 phút (nhanh hơn)
cron.schedule('0 * * * *', ...)    // Mỗi giờ (chậm hơn)
```

### Thay Đổi Timeout (10 phút)

In `app/api/bookings/cleanup/route.ts`, line 34:

```typescript
// Hiện tại: 10 phút
const cutoffTime = new Date(now.getTime() - 10 * 60 * 1000)

// Thay đổi:
const cutoffTime = new Date(now.getTime() - 15 * 60 * 1000)  // 15 phút
const cutoffTime = new Date(now.getTime() - 5 * 60 * 1000)   // 5 phút
```

## 🚨 Important Notes

### Production Deployment

**Nếu deploy lên Vercel/Netlify (Serverless):**
- Cron jobs **KHÔNG HOẠT ĐỘNG** vì serverless function chỉ chạy khi có request
- Cần sử dụng:
  - **Vercel Cron Jobs** (vercel.json)
  - **External cron service** (cron-job.org, EasyCron)
  - **Self-hosted server** (VPS, Docker)

**Nếu deploy lên VPS/Docker:**
- Cron jobs hoạt động bình thường ✅
- Đảm bảo process luôn chạy (PM2, systemd)

### Security

1. **THAY ĐỔI `CRON_SECRET` trong production:**
   ```bash
   # Generate random secret
   openssl rand -hex 32
   ```

2. **Không commit `.env.local` vào Git**

3. **API endpoint có authentication** → Chỉ cron job hoặc admin có thể gọi

## 🎯 Next Steps

1. **Start dev server:**
   ```bash
   pnpm dev
   ```

2. **Kiểm tra logs:**
   - Xem console có message "🚀 Initializing cron jobs..." không
   - Mỗi 2 phút xem có message "⏰ Running booking cleanup job..." không

3. **Test bằng cách tạo booking:**
   - Tạo booking mới
   - Đợi 10 phút
   - Đợi thêm 2 phút (để cron chạy)
   - Check booking có bị cancel không

4. **Verify database:**
   ```javascript
   db.bookings.find({
     status: 'cancelled',
     cancelReason: { $regex: /Auto-cancelled: Payment timeout/ }
   })
   ```

## 📞 Support

Nếu có vấn đề:
1. Check logs trong console
2. Check API endpoint: `GET /api/cron/status`
3. Test manual: `curl -X POST .../api/bookings/cleanup`
4. Đọc `lib/cron/README.md` để troubleshooting

---

**Tác giả:** GitHub Copilot  
**Ngày tạo:** 2025-10-22  
**Version:** 1.0.0
