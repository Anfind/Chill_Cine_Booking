# 🔐 TTLock API Integration Guide - Chill Cine Booking

**Date:** October 27, 2025  
**Purpose:** Tích hợp khóa thông minh TTLock để khách tự mở cửa phòng cinema

---

## 📋 MỤC TIÊU

Sau khi thanh toán thành công, khách có thể:
1. Tra cứu mã booking
2. Xem thông tin phòng
3. **Nhấn nút "MỞ CỬA"** → Cửa phòng cinema mở tự động

---

## 🎯 KIẾN TRÚC HỆ THỐNG

```
[Chill Cine Web] 
      ↓ HTTPS
[TTLock Cloud API] (api.sciener.com)
      ↓ Internet
[TTLock Gateway] (G2/G3 tại chi nhánh)
      ↓ Bluetooth
[TTLock Smart Lock] (Khóa cửa phòng)
```

---

## 🔑 BƯỚC 1: ĐĂNG KÝ TÀI KHOẢN

### 1.1 Đăng ký Developer Account
```
URL: https://euopen.ttlock.com/register
- Điền thông tin công ty
- Chờ duyệt: 1-3 ngày làm việc
- Nhận: client_id + client_secret
```

### 1.2 Lấy Access Token
```http
POST https://euopen.ttlock.com/oauth2/token
Content-Type: application/x-www-form-urlencoded

client_id=YOUR_CLIENT_ID
&client_secret=YOUR_CLIENT_SECRET
&grant_type=client_credentials

Response:
{
  "access_token": "xxxxxx",
  "expires_in": 7776000,  // 90 ngày
  "token_type": "Bearer"
}
```

**Lưu access_token vào `.env.local`:**
```bash
TTLOCK_CLIENT_ID=your_client_id
TTLOCK_CLIENT_SECRET=your_secret
TTLOCK_ACCESS_TOKEN=your_access_token
```

---

## 🔌 BƯỚC 2: API ENDPOINTS CHÍNH

### 2.1 Unlock Door (MỞ CỬA) ⭐
```http
POST https://api.sciener.com/v3/lock/unlock
Content-Type: application/x-www-form-urlencoded

clientId=YOUR_CLIENT_ID
&accessToken=YOUR_ACCESS_TOKEN
&lockId=123456
&date=1698345600000

Response:
{
  "errcode": 0,
  "errmsg": "success"
}
```

**Error Codes:**
- `0`: Thành công
- `-4043`: Chưa bật "Remote unlock" trong app
- `-3`: Access token hết hạn
- `-1`: Thiếu params

### 2.2 Get Lock Detail
```http
GET https://api.sciener.com/v3/lock/detail?clientId=xxx&accessToken=xxx&lockId=123456&date=xxx

Response:
{
  "lockId": 123456,
  "lockAlias": "Cinema Room 01",
  "electricQuantity": 85,  // Battery %
  "lockMac": "AA:BB:CC:DD:EE:FF",
  "lockSound": 1  // 1=locked, 2=unlocked
}
```

### 2.3 Initialize Lock (Khởi tạo khóa - Làm 1 lần)
```http
POST https://api.sciener.com/v3/lock/initialize

lockData=xxx  // Từ TTLock app
&lockAlias=Cinema Room 01
```

---

## 💻 BƯỚC 3: CODE IMPLEMENTATION

### 3.1 TTLock Service
```typescript
// lib/ttlock/service.ts
export class TTLockService {
  private baseURL = 'https://api.sciener.com'
  private clientId = process.env.TTLOCK_CLIENT_ID!
  private accessToken = process.env.TTLOCK_ACCESS_TOKEN!

  async unlockDoor(lockId: number): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseURL}/v3/lock/unlock`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
          clientId: this.clientId,
          accessToken: this.accessToken,
          lockId: lockId.toString(),
          date: Date.now().toString(),
        }),
      })

      const data = await response.json()
      
      if (data.errcode === 0) {
        return true
      } else {
        console.error('TTLock unlock failed:', data)
        return false
      }
    } catch (error) {
      console.error('TTLock API error:', error)
      return false
    }
  }

  async getLockStatus(lockId: number) {
    const params = new URLSearchParams({
      clientId: this.clientId,
      accessToken: this.accessToken,
      lockId: lockId.toString(),
      date: Date.now().toString(),
    })

    const response = await fetch(`${this.baseURL}/v3/lock/detail?${params}`)
    return response.json()
  }
}
```

### 3.2 Database Models

**Room Model:**
```typescript
// lib/models/Room.ts
interface IRoom {
  // ...existing fields
  ttlock?: {
    lockId: number           // TTLock ID
    lockAlias: string        // Tên khóa
    macAddress?: string
    status: 'active' | 'offline'
  }
}
```

**Booking Model:**
```typescript
// lib/models/Booking.ts
interface IBooking {
  // ...existing fields
  unlockLogs?: Array<{
    unlockedAt: Date
    method: 'web' | 'app'
    success: boolean
  }>
}
```

### 3.3 API Endpoint - Unlock
```typescript
// app/api/booking/unlock/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { TTLockService } from '@/lib/ttlock/service'
import Booking from '@/lib/models/Booking'
import Room from '@/lib/models/Room'

export async function POST(req: NextRequest) {
  const { bookingCode } = await req.json()
  
  const booking = await Booking.findOne({ bookingCode }).populate('roomId')
  
  if (!booking) {
    return NextResponse.json({ error: 'Booking not found' }, { status: 404 })
  }

  // Validate time
  const now = new Date()
  if (now < booking.startTime || now > booking.endTime) {
    return NextResponse.json({ error: 'Ngoài giờ cho phép' }, { status: 403 })
  }

  // Validate payment
  if (booking.paymentStatus !== 'paid') {
    return NextResponse.json({ error: 'Chưa thanh toán' }, { status: 403 })
  }

  const room = booking.roomId as any
  if (!room.ttlock?.lockId) {
    return NextResponse.json({ error: 'Phòng chưa có khóa' }, { status: 400 })
  }

  // Unlock
  const ttlock = new TTLockService()
  const success = await ttlock.unlockDoor(room.ttlock.lockId)

  if (success) {
    // Log
    booking.unlockLogs = booking.unlockLogs || []
    booking.unlockLogs.push({
      unlockedAt: new Date(),
      method: 'web',
      success: true,
    })
    
    if (!booking.checkInTime) {
      booking.checkInTime = new Date()
      booking.status = 'checked-in'
    }
    
    await booking.save()
    
    return NextResponse.json({ success: true, message: 'Đã mở cửa!' })
  } else {
    return NextResponse.json({ error: 'Không thể mở cửa' }, { status: 500 })
  }
}
```

### 3.4 Frontend - Unlock Page
```tsx
// app/booking/check/page.tsx
"use client"

import { useState } from 'react'
import { Button } from '@/components/ui/button'

export default function BookingCheckPage() {
  const [booking, setBooking] = useState<any>(null)
  const [unlocking, setUnlocking] = useState(false)

  const handleUnlock = async () => {
    setUnlocking(true)
    try {
      const res = await fetch('/api/booking/unlock', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bookingCode: booking.bookingCode }),
      })

      const data = await res.json()
      
      if (res.ok) {
        alert('🔓 Cửa đã mở!')
      } else {
        alert('❌ ' + data.error)
      }
    } finally {
      setUnlocking(false)
    }
  }

  return (
    <div>
      {booking?.canUnlock && (
        <Button 
          onClick={handleUnlock} 
          disabled={unlocking}
          className="w-full bg-green-600"
        >
          {unlocking ? 'Đang mở...' : '🔓 MỞ CỬA PHÒNG'}
        </Button>
      )}
    </div>
  )
}
```

---

## 🛠️ BƯỚC 4: SETUP PHẦN CỨNG

### 4.1 Thiết bị cần mua
| Thiết bị | Số lượng | Giá (ước tính) |
|----------|----------|----------------|
| TTLock Gateway G3 | 7 (1/chi nhánh) | ~$70/cái |
| TTLock Smart Lock | 28 (1/phòng) | ~$120/cái |
| **Tổng** | | **~$3,850** |

### 4.2 Cài đặt
1. **Gateway:**
   - Cắm nguồn tại chi nhánh
   - Kết nối WiFi (2.4GHz)
   - Note: 1 gateway quản lý ~50 locks

2. **Smart Lock:**
   - Cài vào cửa phòng
   - Thay pin AA (6 months)
   - Pairing qua app TTLock

3. **Khởi tạo:**
   - Dùng app TTLock Admin
   - Scan mỗi khóa → Lấy `lockId`
   - Lưu lockId vào database (Room model)

---

## ✅ BƯỚC 5: TESTING

### Test Cases
```
✅ Unlock trong giờ booking + đã thanh toán → SUCCESS
❌ Unlock ngoài giờ → BLOCK
❌ Unlock chưa thanh toán → BLOCK
✅ Multiple unlocks → All SUCCESS (log mỗi lần)
⚠️ Gateway offline → FAIL (show error)
⚠️ Lock low battery → WARNING (still work, notify admin)
```

---

## 🔒 BẢO MẬT

### Validate Logic
```typescript
// Check all conditions before unlock
1. Booking exists ✅
2. Payment = 'paid' ✅
3. Current time in [startTime, endTime] ✅
4. Lock exists & online ✅
5. Rate limit: Max 10 unlocks/booking ✅
```

### Security Best Practices
- ✅ Never expose `accessToken` to client
- ✅ All unlock calls from server-side
- ✅ Log every unlock attempt (IP, time, result)
- ✅ Alert admin if too many failures

---

## 📊 MONITORING

### Dashboard Metrics
```
- Total unlocks today
- Failed unlock attempts
- Low battery locks (< 20%)
- Offline gateways
- Average unlock response time
```

### Alerts
```
⚠️ Battery < 20% → SMS to admin
🚨 Gateway offline → Email + SMS
❌ 3+ failed unlocks → Notify staff
```

---

## 🎯 TIMELINE TRIỂN KHAI

### Phase 1: Setup (1 tuần)
- [ ] Đăng ký TTLock account
- [ ] Mua thiết bị (Gateway + Locks)
- [ ] Cài đặt phần cứng tại 1 chi nhánh pilot

### Phase 2: Development (3-5 ngày)
- [ ] Code TTLock service (1 ngày)
- [ ] API endpoints (1 ngày)
- [ ] Frontend unlock page (1 ngày)
- [ ] Testing (1-2 ngày)

### Phase 3: Pilot (1 tuần)
- [ ] Deploy tại 1 chi nhánh
- [ ] Test với khách thật
- [ ] Thu thập feedback
- [ ] Fix bugs

### Phase 4: Rollout (2 tuần)
- [ ] Cài đặt 6 chi nhánh còn lại
- [ ] Train staff
- [ ] Monitor & optimize

---

## 📞 HỖ TRỢ

**TTLock Support:**
- Email: service@ttlock.com
- Docs: https://euopen.ttlock.com/document
- API: https://api.sciener.com

**Implementation Support:**
- Developer: GitHub Copilot
- Timeline: 3-5 days coding
- Budget: ~$3,850 hardware

---

## ✅ CHECKLIST

### Trước khi triển khai:
- [ ] Có tài khoản TTLock Developer
- [ ] Có access_token (valid 90 days)
- [ ] Đã mua đủ thiết bị
- [ ] Gateway kết nối WiFi
- [ ] Locks đã pairing
- [ ] Có lockId của mỗi phòng

### Code ready:
- [ ] TTLock service
- [ ] API endpoint `/api/booking/unlock`
- [ ] Frontend unlock button
- [ ] Database models updated
- [ ] Error handling
- [ ] Logging system

### Production:
- [ ] Test tất cả scenarios
- [ ] Setup monitoring
- [ ] Alert system
- [ ] Staff training
- [ ] Customer guide

---

**Status:** 📝 Document ready  
**Next:** Code implementation (3-5 days)
