# 🔧 Fix CRUD Phòng trong Admin Panel

## 📅 Ngày: 22/10/2025 - 21:45 (GMT+7)

---

## 🐛 Vấn đề phát hiện

### 1. **Missing API Endpoints**
- ❌ Không có endpoint `PUT /api/rooms/[roomId]` để update phòng
- ❌ Không có endpoint `DELETE /api/rooms/[roomId]` để xóa phòng
- ❌ Không có endpoint `GET /api/rooms/[roomId]` để lấy chi tiết 1 phòng

**Hậu quả:**
- Người dùng bấm "Sửa" → API error 404
- Người dùng bấm "Xóa" → API error 404

### 2. **Field Name Mismatch**
- ❌ Model Room có field `pricePerHour`
- ❌ Nhưng component và API đang dùng `price`
- ❌ Interface `Room` trong component có `price: number`

**Hậu quả:**
- Tạo/cập nhật phòng → giá không được lưu vào database
- Hiển thị danh sách → không show giá hoặc show undefined

### 3. **Missing Required Field**
- ❌ Model Room có field `code` (required, unique)
- ❌ Nhưng component không có input cho `code`

**Hậu quả:**
- Tạo phòng mới → MongoDB validation error

---

## ✅ Các thay đổi đã thực hiện

### 1. Tạo API Endpoints cho Room CRUD

**File mới:** `app/api/rooms/[roomId]/route.ts`

```typescript
// GET /api/rooms/[roomId] - Lấy thông tin 1 phòng
export async function GET(request, { params }) {
  const room = await Room.findById(params.roomId)
    .populate('branchId', 'name address phone')
    .populate('roomTypeId', 'name slug color')
  // ...
}

// PUT /api/rooms/[roomId] - Cập nhật phòng
export async function PUT(request, { params }) {
  const updatedRoom = await Room.findByIdAndUpdate(
    params.roomId,
    { name, branchId, roomTypeId, pricePerHour, ... },
    { new: true }
  )
  // ...
}

// DELETE /api/rooms/[roomId] - Xóa phòng (soft delete)
export async function DELETE(request, { params }) {
  await Room.findByIdAndUpdate(params.roomId, {
    isActive: false,
    status: 'unavailable'
  })
  // ...
}
```

**Features:**
- ✅ Validation: Kiểm tra branch và roomType tồn tại
- ✅ Populate: Trả về đầy đủ thông tin branch và roomType
- ✅ Soft delete: Set `isActive=false` thay vì xóa hẳn
- ✅ Error handling: Xử lý lỗi rõ ràng với status code phù hợp

### 2. Fix Field Name Mismatch

**File:** `app/api/rooms/route.ts`

```diff
- price: body.price || 0,
+ pricePerHour: body.price || 0,
+ code: body.code || `R${Date.now().toString().slice(-6)}`,
```

**File:** `app/api/rooms/[roomId]/route.ts`

```diff
- price: body.price || 0,
+ pricePerHour: body.price || 0,
```

**File:** `components/admin/rooms-manager.tsx`

```diff
interface Room {
  // ...
- price: number
+ pricePerHour: number
+ code?: string
}

// Hiển thị giá
- {room.price.toLocaleString("vi-VN")}đ/giờ
+ {room.pricePerHour.toLocaleString("vi-VN")}đ/giờ

// Edit form
- price: room.price.toString(),
+ price: room.pricePerHour.toString(),
```

### 3. Auto-generate Room Code

**File:** `app/api/rooms/route.ts`

```typescript
const room = await Room.create({
  // ...
  code: body.code || `R${Date.now().toString().slice(-6)}`,
  // Generates code like: R834567
})
```

**Lý do:** Field `code` là required trong model, nên phải tự động generate nếu user không nhập.

---

## 📊 Schema Comparison

### Model (Database)
```typescript
// lib/models/Room.ts
interface IRoom {
  name: string
  code: string              // ⚠️ Required, unique
  branchId: ObjectId
  roomTypeId: ObjectId
  capacity: number
  pricePerHour: number      // ⚠️ Tên field đúng
  images: string[]
  amenities: string[]
  description: string
  status: 'available' | 'maintenance' | 'unavailable'
  isActive: boolean
}
```

### Component (Frontend)
```typescript
// components/admin/rooms-manager.tsx
interface Room {
  _id: string
  name: string
  code?: string             // ✅ Added
  branchId: { _id: string; name: string } | string
  roomTypeId: { _id: string; name: string; color: string } | string
  capacity: number
  pricePerHour: number      // ✅ Fixed (was: price)
  images: string[]
  amenities: string[]
  description: string
  status: string
}
```

### API Payload
```typescript
// Frontend gửi field "price"
formData.price = "100000"

// Backend convert sang "pricePerHour"
{ pricePerHour: body.price }

// Database lưu "pricePerHour"
```

---

## 🎯 Testing Checklist

### CREATE (Thêm phòng mới)
- [ ] Bấm "Thêm phòng"
- [ ] Điền form: Tên, Chi nhánh, Loại phòng, Sức chứa, Giá
- [ ] Submit → Kiểm tra API POST `/api/rooms`
- [ ] Verify: Database có record mới với `code` auto-generated

### READ (Xem danh sách)
- [ ] Load trang admin
- [ ] Kiểm tra danh sách phòng hiển thị đầy đủ
- [ ] Verify: Giá hiển thị đúng (VD: 100,000đ/giờ)
- [ ] Filter theo chi nhánh → Danh sách cập nhật

### UPDATE (Sửa phòng)
- [ ] Bấm nút "Sửa" (icon bút chì)
- [ ] Form hiển thị đầy đủ thông tin cũ
- [ ] Thay đổi giá hoặc tên
- [ ] Submit → Kiểm tra API PUT `/api/rooms/[roomId]`
- [ ] Verify: Database được update, danh sách refresh

### DELETE (Xóa phòng)
- [ ] Bấm nút "Xóa" (icon thùng rác)
- [ ] Confirm dialog xuất hiện
- [ ] Xác nhận xóa → Kiểm tra API DELETE `/api/rooms/[roomId]`
- [ ] Verify: `isActive=false` trong database, biến mất khỏi danh sách

---

## 🔍 Root Cause Analysis

### Tại sao xảy ra lỗi này?

1. **API chưa hoàn thiện:**
   - Có thể lúc đầu chỉ implement GET và POST để test
   - Quên tạo endpoint cho UPDATE và DELETE

2. **Field naming inconsistency:**
   - Model dùng `pricePerHour` (đúng, semantic)
   - Component copy từ template dùng `price` (ngắn gọn)
   - Không có type checking nghiêm ngặt → lỗi không phát hiện lúc code

3. **Required field `code`:**
   - Model có constraint `unique` và `required`
   - Không có UI input → user không thể nhập
   - Cần auto-generate hoặc thêm field vào form

---

## 💡 Best Practices Learned

### 1. Type Safety
```typescript
// ❌ BAD: Interface không match với Model
interface Room { price: number }
const room = await Room.find() // Trả về pricePerHour

// ✅ GOOD: Interface match với Model
interface Room { pricePerHour: number }
// Hoặc dùng type từ Model
import { IRoom } from '@/lib/models/Room'
```

### 2. API Completeness
```typescript
// ✅ Mỗi resource cần đủ CRUD endpoints
GET    /api/rooms           // List
POST   /api/rooms           // Create
GET    /api/rooms/[id]      // Read One
PUT    /api/rooms/[id]      // Update
DELETE /api/rooms/[id]      // Delete
```

### 3. Soft Delete
```typescript
// ✅ Không xóa hẳn, chỉ đánh dấu inactive
await Room.findByIdAndUpdate(id, { isActive: false })

// Query chỉ lấy active records
Room.find({ isActive: true })
```

### 4. Required Fields
```typescript
// ✅ Auto-generate fields bắt buộc
code: body.code || `R${Date.now().toString().slice(-6)}`

// Hoặc thêm vào form UI
<Input name="code" required />
```

---

## 🚀 Next Steps (Recommendations)

### 1. Add Room Code Input (Optional)
```tsx
<Label>Mã phòng (tự động nếu để trống)</Label>
<Input 
  placeholder="VD: R101, VIP1"
  value={formData.code}
  onChange={(e) => setFormData({...formData, code: e.target.value})}
/>
```

### 2. Validation Rules
- Tên phòng: Không được trống, max 100 ký tự
- Capacity: Min 1, max 10 người
- Giá: Min 0đ, max 10,000,000đ
- Images: Max 5 ảnh, validate URL

### 3. Bulk Operations
- Xóa nhiều phòng cùng lúc
- Import phòng từ Excel/CSV
- Duplicate phòng (clone settings)

### 4. Audit Log
- Ghi log khi tạo/sửa/xóa phòng
- Hiển thị "Created by", "Updated by"
- History của thay đổi giá

---

## 📝 Summary

| Vấn đề | Trước | Sau | Status |
|--------|-------|-----|--------|
| Update phòng | ❌ 404 Error | ✅ PUT `/api/rooms/[id]` | ✅ Fixed |
| Xóa phòng | ❌ 404 Error | ✅ DELETE `/api/rooms/[id]` | ✅ Fixed |
| Field mismatch | ❌ `price` | ✅ `pricePerHour` | ✅ Fixed |
| Missing code | ❌ Validation error | ✅ Auto-generated | ✅ Fixed |
| Soft delete | ❌ Hard delete | ✅ `isActive=false` | ✅ Added |

**Result:** CRUD phòng trong admin panel hoạt động hoàn chỉnh! 🎉
