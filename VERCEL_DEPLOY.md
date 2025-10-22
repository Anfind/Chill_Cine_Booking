# 🚀 Vercel Deployment Checklist

## ✅ Files Updated (Ready to Push)

- [x] `vercel.json` - Cron schedule changed to `0 * * * *` (every hour)
- [x] `lib/mongodb.ts` - Added serverApi config for Vercel
- [x] `.env.production.example` - Production environment variables template

## 📋 Next Steps

### 1. **Push Code to GitHub**

```bash
git add .
git commit -m "fix: optimize for vercel deployment"
git push origin deploy
```

### 2. **Set Environment Variables in Vercel**

Vào Vercel Dashboard → Project Settings → Environment Variables

Copy từ file `.env.production.example` và paste vào Vercel:

```env
MONGODB_URI=mongodb+srv://nguyenthaian210506_db_user:5dYwg2jOTXmphkKn@chillcine.uueauxd.mongodb.net/chill-cine-hotel?retryWrites=true&w=majority&appName=Chillcine

NEXT_PUBLIC_APP_URL=https://chill-cine.vercel.app
NEXT_PUBLIC_HOTLINE=0989760000

NEXTAUTH_SECRET=chill-cine-hotel-super-secret-key-2025-production-ready-32-chars-minimum
NEXTAUTH_URL=https://chill-cine.vercel.app

CRON_SECRET=chill-cine-cron-secret-key-2025-very-secure-random-string-change-in-production

PAY2S_PARTNER_CODE=PAY2S8FE2PW8DSTKYTWN
PAY2S_ACCESS_KEY=40fc988c0c175b57096f15bb03b4d098400f60b1f66d934446ec9063d45f6cfa
PAY2S_SECRET_KEY=872e484b36d07f1d92e3f8a1ddaacac5f2e7d68b0fb5a6ac6b25d2ee51c78a58
PAY2S_API_URL=https://payment.pay2s.vn/v1/gateway/api
PAY2S_WEBHOOK_SECRET=cf88cba6072a22f9798185eda8d9025b01424672d635570727

PAY2S_BANK_CODE=ACB
PAY2S_ACCOUNT_NUMBER=22226061
PAY2S_ACCOUNT_NAME=HÀ VĂN TÙNG

PAY2S_REDIRECT_URL=https://chill-cine.vercel.app/payment/success
PAY2S_IPN_URL=https://chill-cine.vercel.app/api/payment/pay2s/ipn
```

### 3. **MongoDB Atlas Configuration**

1. Vào MongoDB Atlas → Network Access
2. Add IP Address: `0.0.0.0/0` (Allow all - for Vercel)
3. Click "Confirm"

### 4. **Pay2S Dashboard Configuration**

1. Vào https://my.pay2s.vn/
2. Payment Integration Center
3. Update:
   - **Redirect URL:** `https://chill-cine.vercel.app/payment/success`
   - **IPN URL:** `https://chill-cine.vercel.app/api/payment/pay2s/ipn`

### 5. **Verify Deployment**

Sau khi Vercel deploy xong:

1. ✅ Check homepage: https://chill-cine.vercel.app/
2. ✅ Test admin login: https://chill-cine.vercel.app/admin
   - Email: `admin@chillcine.com`
   - Password: `Admin@123`
3. ✅ Test booking flow
4. ✅ Check Vercel logs for errors

### 6. **Cron Job Verification**

1. Vào Vercel Dashboard → Project → Cron Jobs
2. Verify job is scheduled: `/api/bookings/cleanup` @ `0 * * * *`
3. Wait 1 hour and check logs

---

## 🎯 What Was Fixed

### Issue 1: Cron Schedule Too Frequent
**Before:** `*/10 * * * *` (every 10 minutes) - Too frequent for Hobby plan
**After:** `0 * * * *` (every hour) - Within Hobby plan limits

### Issue 2: MongoDB Connection in Serverless
**Before:** Missing `serverApi` configuration
**After:** Added `serverApi` config for Vercel compatibility

### Issue 3: Environment Variables
**Before:** Using ngrok URLs and localhost
**After:** All URLs point to `https://chill-cine.vercel.app`

---

## 🔍 Troubleshooting

If deployment still fails:

1. **Check Build Logs:**
   - Vercel Dashboard → Deployments → Click failed deployment
   - Look for error messages

2. **Check Function Logs:**
   - Vercel Dashboard → Functions
   - Look for runtime errors

3. **Common Issues:**
   - MongoDB connection timeout → Check IP whitelist
   - Environment variables missing → Verify all vars set
   - Cron job quota exceeded → Already fixed (hourly schedule)

---

## 📞 Need Help?

If you see any errors after deployment:
1. Screenshot the error
2. Share the Vercel deployment URL
3. Share the error logs

---

**Ready to deploy! Run the command above to push changes.** 🚀
