# 🚀 Hướng Dẫn Deploy Lên Vercel

## 📋 Các Bước Deploy

### 1. **Chuẩn Bị MongoDB Atlas**

Đảm bảo bạn đã có MongoDB Atlas cluster:
- Truy cập: https://cloud.mongodb.com/
- Tạo cluster (nếu chưa có)
- Lấy connection string: `mongodb+srv://username:password@cluster.mongodb.net/database-name`

### 2. **Push Code Lên GitHub**

```bash
git add .
git commit -m "chore: prepare for vercel deployment"
git push origin main
```

### 3. **Import Project Vào Vercel**

1. Truy cập: https://vercel.com/
2. Click **"Add New Project"**
3. Import repository từ GitHub
4. Chọn repository `Chill_Cine_Booking`

### 4. **Cấu Hình Environment Variables**

Trong Vercel Project Settings → Environment Variables, thêm các biến sau:

#### **Required Variables:**

```env
# MongoDB
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/database-name?retryWrites=true&w=majority

# App URLs
NEXT_PUBLIC_APP_URL=https://your-domain.vercel.app
NEXT_PUBLIC_HOTLINE=0989760000

# NextAuth Security
NEXTAUTH_SECRET=your-32-character-random-secret-key
NEXTAUTH_URL=https://your-domain.vercel.app

# Cron Security
CRON_SECRET=your-secure-cron-secret

# Pay2S Payment Gateway
PAY2S_PARTNER_CODE=your_partner_code
PAY2S_ACCESS_KEY=your_access_key
PAY2S_SECRET_KEY=your_secret_key
PAY2S_API_URL=https://payment.pay2s.vn/v1/gateway/api
PAY2S_WEBHOOK_SECRET=your_webhook_secret

# Bank Info
PAY2S_BANK_CODE=ACB
PAY2S_ACCOUNT_NUMBER=your_account_number
PAY2S_ACCOUNT_NAME=YOUR ACCOUNT NAME

# Payment Callbacks
PAY2S_REDIRECT_URL=https://your-domain.vercel.app/payment/success
PAY2S_IPN_URL=https://your-domain.vercel.app/api/payment/pay2s/ipn
```

#### **Cách Generate NEXTAUTH_SECRET:**

```bash
openssl rand -base64 32
```

### 5. **Deploy**

Click **"Deploy"** và đợi Vercel build project.

### 6. **Cấu Hình Vercel Cron Jobs**

Cron job đã được cấu hình trong `vercel.json`:

```json
{
  "crons": [
    {
      "path": "/api/bookings/cleanup",
      "schedule": "*/10 * * * *"
    }
  ]
}
```

**Lưu ý:** 
- Vercel Cron chạy mỗi 10 phút (thay vì 2 phút như local)
- Cron job sẽ tự động chạy sau khi deploy
- Không cần cài đặt thêm gì

### 7. **Seed Database (Sau Deploy Lần Đầu)**

Sau khi deploy xong, bạn cần seed data vào database:

**Option A: Chạy local và seed lên MongoDB Atlas**

```bash
# Cập nhật .env.local với MONGODB_URI từ Atlas
MONGODB_URI=mongodb+srv://...

# Chạy seed script
pnpm db:seed
```

**Option B: Tạo API endpoint để seed từ browser**

Truy cập: `https://your-domain.vercel.app/api/admin/seed` (nếu đã tạo endpoint này)

### 8. **Kiểm Tra Deploy**

1. **Homepage:** https://your-domain.vercel.app/
   - ✅ Location selector hiển thị
   - ✅ Cities và branches load được

2. **Admin Login:** https://your-domain.vercel.app/admin
   - Email: `admin@chillcine.com`
   - Password: `Admin@123`
   - ✅ Login thành công → redirect to admin dashboard

3. **Booking Flow:**
   - ✅ Chọn chi nhánh → Xem phòng
   - ✅ Đặt phòng → Payment page
   - ✅ QR Code hiển thị

4. **Cron Job:**
   - ✅ Sau 10 phút, booking pending sẽ tự động cancelled
   - ✅ Check logs trong Vercel Dashboard → Functions → Cron Logs

---

## 🔧 Troubleshooting

### Lỗi: "Cannot connect to MongoDB"

**Nguyên nhân:** IP chưa được whitelist trong MongoDB Atlas

**Giải pháp:**
1. Vào MongoDB Atlas → Network Access
2. Thêm IP `0.0.0.0/0` (allow all) hoặc Vercel IPs
3. Redeploy project

### Lỗi: "NextAuth configuration error"

**Nguyên nhân:** NEXTAUTH_SECRET hoặc NEXTAUTH_URL chưa đúng

**Giải pháp:**
1. Kiểm tra Environment Variables trong Vercel
2. NEXTAUTH_SECRET phải có ít nhất 32 ký tự
3. NEXTAUTH_URL phải match với production domain

### Lỗi: "Payment gateway error"

**Nguyên nhân:** Pay2S credentials chưa đúng hoặc callback URLs sai

**Giải pháp:**
1. Kiểm tra Pay2S credentials trong Environment Variables
2. Cập nhật callback URLs trong Pay2S dashboard:
   - Redirect URL: `https://your-domain.vercel.app/payment/success`
   - IPN URL: `https://your-domain.vercel.app/api/payment/pay2s/ipn`

### Cron Job không chạy

**Nguyên nhân:** Vercel Cron Jobs chỉ hoạt động trên Production

**Giải pháp:**
1. Deploy lên Production (không phải Preview)
2. Kiểm tra Vercel Dashboard → Cron Jobs
3. Xem logs trong Functions tab

---

## 📊 Monitoring

### Vercel Dashboard

- **Analytics:** Xem traffic, performance
- **Functions:** Xem logs của API routes
- **Cron Jobs:** Xem execution history của cron jobs

### MongoDB Atlas

- **Metrics:** CPU, Memory, Connections
- **Slow Queries:** Tối ưu database
- **Backup:** Cấu hình automatic backup

---

## 🔐 Security Checklist

- [ ] NEXTAUTH_SECRET đủ mạnh (32+ chars)
- [ ] CRON_SECRET được set
- [ ] MongoDB Atlas Network Access chỉ allow Vercel IPs
- [ ] Pay2S webhook secret được cấu hình đúng
- [ ] Không commit sensitive data vào Git
- [ ] .env.local và .env không được track (có trong .gitignore)

---

## 📈 Next Steps

Sau khi deploy thành công:

1. **Custom Domain:** Thêm domain riêng trong Vercel settings
2. **SSL:** Vercel tự động cấp SSL certificate
3. **CDN:** Static assets được serve qua Vercel Edge Network
4. **Monitoring:** Thiết lập alerts cho errors/downtime
5. **Analytics:** Kích hoạt Vercel Analytics hoặc Google Analytics

---

## 📚 Tài Liệu Tham Khảo

- [Vercel Deployment](https://vercel.com/docs/concepts/deployments)
- [Vercel Cron Jobs](https://vercel.com/docs/cron-jobs)
- [Next.js Deployment](https://nextjs.org/docs/deployment)
- [MongoDB Atlas](https://www.mongodb.com/docs/atlas/)

---

**Cập nhật:** Tháng 10/2025
