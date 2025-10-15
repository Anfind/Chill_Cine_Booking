# 🔧 Bug Fix: Mongoose Schema Registration Error

## ❌ Lỗi gặp phải

```
MissingSchemaError: Schema hasn't been registered for model "RoomType".
Use mongoose.model(name, schema)
```

## 🔍 Nguyên nhân

Khi sử dụng Mongoose với Next.js, có vấn đề về **import order**:
- Khi API route import `Room` model
- `Room` schema có reference đến `RoomType`
- Nhưng `RoomType` model chưa được import/register
- → Mongoose không biết schema `RoomType` là gì

## ✅ Giải pháp

### 1. Tạo Model Registry
**File:** `lib/models/index.ts`

```typescript
/**
 * Model Registry
 * Import tất cả models để đảm bảo Mongoose register schemas
 */

import City from './City'
import Branch from './Branch'
import RoomType from './RoomType'
import Room from './Room'
import ComboPackage from './ComboPackage'
import MenuItem from './MenuItem'
import Booking from './Booking'

export { City, Branch, RoomType, Room, ComboPackage, MenuItem, Booking }
```

**Lợi ích:**
- ✅ Đảm bảo tất cả models được load cùng lúc
- ✅ Tránh circular dependencies
- ✅ Single source of truth cho model imports

### 2. Update API Routes

**Before:**
```typescript
import Room from '@/lib/models/Room'
```

**After:**
```typescript
import { Room, Branch, RoomType } from '@/lib/models'
```

**Files updated:**
- ✅ `app/api/cities/route.ts`
- ✅ `app/api/branches/route.ts`
- ✅ `app/api/branches/[id]/route.ts`
- ✅ `app/api/rooms/route.ts`
- ✅ `app/api/rooms/[id]/route.ts`
- ✅ `app/api/combos/route.ts`
- ✅ `app/api/menu/route.ts`
- ✅ `app/api/bookings/route.ts`
- ✅ `app/api/bookings/[id]/route.ts`

## 📝 Pattern để import models

### ✅ ĐÚNG - Sử dụng Model Registry
```typescript
import { Room, Branch, RoomType } from '@/lib/models'

// Tất cả models đã được registered
const rooms = await Room.find()
  .populate('branchId')
  .populate('roomTypeId')
```

### ❌ SAI - Import trực tiếp
```typescript
import Room from '@/lib/models/Room'
// RoomType chưa được imported/registered
// → Lỗi khi populate('roomTypeId')
```

## 🎯 Testing

### Test API Rooms
```bash
# Trước khi fix: 500 Error
# Sau khi fix: 200 OK

curl http://localhost:3000/api/rooms?branchId=xxx&status=available
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "_id": "...",
      "name": "Cinema Room A",
      "roomTypeId": {
        "name": "Luxury",
        "slug": "luxury",
        "color": "#ec4899"
      },
      "branchId": {
        "name": "Chi nhánh Q1",
        "address": "123 Đường ABC"
      }
    }
  ],
  "count": 4
}
```

## ⚠️ Bonus: Fix Duplicate Index Warnings

**Warning:**
```
[MONGOOSE] Warning: Duplicate schema index on {"slug":1} found.
```

**Nguyên nhân:**
- Schema có `slug: { unique: true }` → auto index
- Và có `RoomTypeSchema.index({ slug: 1 })` → duplicate

**Giải pháp:**
```typescript
// Option 1: Remove schema.index()
RoomTypeSchema.index({ slug: 1 }) // ← XÓA dòng này

// Option 2: Remove unique: true, keep manual index
slug: {
  type: String,
  required: true,
  // unique: true,  // ← XÓA unique
}
RoomTypeSchema.index({ slug: 1 }, { unique: true }) // ← GIỮ manual index
```

**Recommended:** Option 1 (dùng `unique: true` trong field definition)

## 📊 Models Relationship

```
City
  └─ branches[] → Branch
       └─ rooms[] → Room
            ├─ roomTypeId → RoomType
            └─ bookings[] → Booking
                 ├─ comboPackageId → ComboPackage
                 └─ menuItems[] → MenuItem
```

**Import order importance:**
1. City (không dependencies)
2. Branch (depends on City)
3. RoomType (không dependencies)
4. Room (depends on Branch, RoomType)
5. ComboPackage (không dependencies)
6. MenuItem (không dependencies)
7. Booking (depends on Room, ComboPackage, MenuItem)

## ✅ Verification

### 1. Check Server Logs
```
✅ MongoDB connected successfully
 GET /api/rooms?branchId=xxx 200 in 90ms  ← OK!
```

### 2. Test in Browser
1. Navigate to Homepage
2. Select City → Branches load ✅
3. Select Branch → Rooms load ✅
4. Check Network tab:
   - `/api/cities` → 200 ✅
   - `/api/branches?cityId=xxx` → 200 ✅
   - `/api/rooms?branchId=xxx` → 200 ✅

## 🎉 Result

**Before:**
```
❌ GET /api/rooms?branchId=xxx 500 in 90ms
Error: Schema hasn't been registered for model "RoomType"
```

**After:**
```
✅ GET /api/rooms?branchId=xxx 200 in 90ms
{
  "success": true,
  "data": [...],
  "count": 4
}
```

## 📚 Lessons Learned

1. **Mongoose + Next.js quirks**
   - Next.js có hot reload → models có thể unregister
   - Cần centralized model registry

2. **Import order matters**
   - Models với references cần import dependencies trước
   - Hoặc import tất cả cùng lúc (best practice)

3. **Single source of truth**
   - `lib/models/index.ts` là nơi duy nhất export models
   - API routes chỉ import từ `@/lib/models`

4. **Testing strategy**
   - Test API endpoints trước
   - Sau đó test UI components
   - Check Network tab trong browser

---

**Status:** ✅ Fixed  
**Last Updated:** October 15, 2025  
**Migration Phase:** Phase 1 - 55% Complete
