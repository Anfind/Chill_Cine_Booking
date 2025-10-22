# Cron Jobs - Automated Tasks

Hệ thống cron jobs tự động để xử lý các tác vụ định kỳ.

## 📋 Danh sách Jobs

### 1. Booking Cleanup Job
**Mục đích:** Tự động hủy các booking pending chưa thanh toán sau 10 phút

**Lịch chạy:** Mỗi 2 phút (*/2 * * * *)

**Logic:**
- Tìm tất cả booking có:
  - `status = 'pending'`
  - `paymentStatus = 'unpaid'`
  - `createdAt < (current_time - 10 minutes)` ← **Dùng createdAt, KHÔNG phải paymentQRCreatedAt**
- **Tại sao dùng `createdAt`?**
  - Đảm bảo **MỌI** booking pending đều bị hủy sau 10 phút
  - Tránh lỗ hổng: User tạo booking nhưng không vào payment page → `paymentQRCreatedAt = null` → Chiếm slot mãi mãi
  - `createdAt` luôn tồn tại (Mongoose tự động tạo)
- Cập nhật:
  - `status = 'cancelled'`
  - `cancelReason = 'Auto-cancelled: Payment timeout (X minutes since booking creation)'`
  - `cancelledAt = current_time`

**Endpoint:** `POST /api/bookings/cleanup`

## 🔧 Cấu hình

### Environment Variables

Thêm vào `.env.local`:

```env
# Cron Job Security
CRON_SECRET=your-secret-key-here

# App URL (required for cron jobs to call API)
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### Timezone

Mặc định: `Asia/Ho_Chi_Minh` (GMT+7)

Có thể thay đổi trong `lib/cron/jobs.ts`:

```typescript
{
  timezone: 'Asia/Ho_Chi_Minh'
}
```

## 🚀 Cách sử dụng

### Development

Cron jobs tự động khởi động khi chạy `pnpm dev`:

```bash
pnpm dev
```

Log sẽ hiển thị:

```
🚀 Initializing cron jobs...
✅ Cron job initialized: Booking Cleanup (every 2 minutes)
   Pattern: */2 * * * * (every 2 minutes)
   Timezone: Asia/Ho_Chi_Minh (GMT+7)
   Status: Running ✓
```

Mỗi 2 phút, log sẽ hiển thị:

```
⏰ [19:42:00] Running booking cleanup job...
✅ Cleanup job completed: 3 booking(s) cancelled
   Cancelled bookings: BK001, BK002, BK003
```

### Production

Cron jobs tự động chạy khi deploy lên production.

**Lưu ý:** Nếu deploy lên Vercel/Netlify (serverless), cron jobs KHÔNG hoạt động. Cần sử dụng:
- Vercel Cron Jobs (vercel.json)
- External cron service (cron-job.org, EasyCron)
- Self-hosted server (VPS, Docker)

## 🧪 Testing

### 1. Test API endpoint trực tiếp

**Preview (không cancel):**

```bash
curl -X GET http://localhost:3000/api/bookings/cleanup \
  -H "Authorization: Bearer your-cron-secret"
```

**Execute (thực sự cancel):**

```bash
curl -X POST http://localhost:3000/api/bookings/cleanup \
  -H "Authorization: Bearer your-cron-secret" \
  -H "Content-Type: application/json"
```

### 2. Check cron job status

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
  "timestamp": "2025-10-22T12:42:00.000Z"
}
```

### 3. Manual test flow

1. Tạo booking mới
2. Chờ 10 phút (hoặc thay đổi cutoff time trong code để test nhanh)
3. Chờ cron job chạy (max 2 phút)
4. Check booking đã bị cancel chưa

## 📊 Monitoring

### Logs

Cron jobs tự động log vào console:

```
⏰ [19:42:00] Running booking cleanup job...
🔍 Searching for expired bookings...
📋 Found 2 expired booking(s):
  - BK001 (ID: 507f1f77bcf86cd799439011) { createdAt: ..., elapsedSeconds: 612, ... }
  - BK002 (ID: 507f1f77bcf86cd799439012) { createdAt: ..., elapsedSeconds: 645, ... }
✅ Successfully cancelled 2 expired booking(s)
✅ Cleanup job completed: 2 booking(s) cancelled
```

### Database Query

Kiểm tra bookings đã bị auto-cancel:

```javascript
db.bookings.find({
  status: 'cancelled',
  cancelReason: { $regex: /Auto-cancelled: Payment timeout/ }
})
```

## 🔒 Security

### Authorization

API cleanup endpoint yêu cầu `Authorization` header:

```
Authorization: Bearer <CRON_SECRET>
```

Nếu không có hoặc sai secret → 401 Unauthorized

### Best Practices

1. **Thay đổi CRON_SECRET trong production:**
   ```env
   CRON_SECRET=$(openssl rand -hex 32)
   ```

2. **Restrict API endpoint (optional):**
   - Chỉ cho phép IP của server gọi API
   - Sử dụng firewall rules

3. **Rate limiting:**
   - Cron job chạy mỗi 2 phút → max 720 requests/day
   - Không cần rate limit vì đã có authentication

## 🛠️ Customization

### Thay đổi lịch chạy

Trong `lib/cron/jobs.ts`, thay đổi cron pattern:

```typescript
// Mỗi 5 phút
cron.schedule('*/5 * * * *', ...)

// Mỗi giờ
cron.schedule('0 * * * *', ...)

// Mỗi ngày lúc 2:00 AM
cron.schedule('0 2 * * *', ...)

// Mỗi 30 giây (testing)
cron.schedule('*/30 * * * * *', ...)
```

**Cron pattern syntax:**

```
* * * * *
│ │ │ │ │
│ │ │ │ └─── Day of week (0-7, 0 & 7 = Sunday)
│ │ │ └───── Month (1-12)
│ │ └─────── Day of month (1-31)
│ └───────── Hour (0-23)
└─────────── Minute (0-59)
```

### Thay đổi timeout (10 phút)

Trong `app/api/bookings/cleanup/route.ts`:

```typescript
// Thay đổi từ 10 phút sang 15 phút
const cutoffTime = new Date(now.getTime() - 15 * 60 * 1000)
```

**Lưu ý:** Nếu thay đổi timeout, cần cập nhật:
- Payment page countdown timer
- QR expiry time
- Documentation

### Thêm job mới

Trong `lib/cron/jobs.ts`:

```typescript
// Job 2: Send reminder emails
const reminderJob = cron.schedule('0 10 * * *', async () => {
  // Logic gửi email nhắc nhở
}, {
  timezone: 'Asia/Ho_Chi_Minh'
})
```

## ⚠️ Troubleshooting

### Cron job không chạy

1. **Check logs:**
   ```
   🚀 Initializing cron jobs...
   ✅ Cron job initialized: ...
   ```
   Nếu không thấy → import bị lỗi trong layout.tsx

2. **Check environment:**
   ```bash
   echo $NODE_ENV
   ```
   Cron không chạy nếu `NODE_ENV=test`

3. **Check API URL:**
   ```bash
   curl $NEXT_PUBLIC_APP_URL/api/cron/status
   ```
   Nếu không kết nối được → sai URL

### Bookings không bị cancel

1. **Check cutoff time:**
   - Booking phải có `paymentQRCreatedAt`
   - Elapsed time phải > 10 phút

2. **Test API manually:**
   ```bash
   curl -X GET http://localhost:3000/api/bookings/cleanup \
     -H "Authorization: Bearer $CRON_SECRET"
   ```
   Check response có bookings nào không

3. **Check database:**
   ```javascript
   db.bookings.find({
     status: 'pending',
     paymentStatus: 'unpaid',
     paymentQRCreatedAt: { $exists: true }
   })
   ```

## 📚 References

- [node-cron documentation](https://github.com/node-cron/node-cron)
- [Crontab.guru - Cron expression editor](https://crontab.guru)
- [Next.js API Routes](https://nextjs.org/docs/app/building-your-application/routing/route-handlers)
