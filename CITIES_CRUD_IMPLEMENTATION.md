# 🏙️ Cities CRUD Implementation - Admin Panel

**Ngày:** 17 Oct 2025  
**Mục đích:** Implement đầy đủ CRUD cho quản lý Tỉnh/Thành phố từ Admin Panel  
**Tính năng:** Thêm, sửa, xóa, toggle active, sắp xếp thứ tự hiển thị

---

## 📋 Tổng Quan

Admin giờ có thể quản lý toàn bộ tỉnh thành trong hệ thống:
- ✅ **Xem** danh sách tất cả tỉnh thành (kể cả inactive)
- ✅ **Thêm** tỉnh thành mới
- ✅ **Sửa** thông tin tỉnh thành
- ✅ **Xóa** tỉnh thành (nếu không có chi nhánh)
- ✅ **Toggle** trạng thái active/inactive
- ✅ **Sắp xếp** thứ tự hiển thị

---

## 🔧 Files Created/Modified

### 1. API Endpoints

#### **`app/api/cities/route.ts`** - GET & POST
```typescript
// GET /api/cities?all=true
// - all=true: Lấy tất cả (admin)
// - all=false hoặc không có: Chỉ lấy active (public)

// POST /api/cities
// Body: { code, name, slug?, isActive?, displayOrder? }
// - Auto-generate slug từ name nếu không cung cấp
// - Validate code unique, lowercase
// - Validate name required
```

#### **`app/api/cities/[id]/route.ts`** - GET, PUT, DELETE (NEW)
```typescript
// GET /api/cities/[id]
// Lấy chi tiết 1 city

// PUT /api/cities/[id]
// Body: { code?, name?, slug?, isActive?, displayOrder? }
// - Validate code unique (nếu thay đổi)
// - Update từng field

// DELETE /api/cities/[id]
// - Check không có branch nào trước khi xóa
// - Return error nếu city đang có branches
```

### 2. Admin UI Component

#### **`components/admin/cities-manager.tsx`** (NEW)

**Features:**
- 📊 **Table view** với sort by displayOrder
- ➕ **Add dialog** - Form thêm city mới
- ✏️ **Edit dialog** - Form sửa city
- 🗑️ **Delete confirmation** - AlertDialog xác nhận xóa
- 🔄 **Toggle active** - Switch on/off trực tiếp trên table
- 🔄 **Auto-reload** sau mỗi action

**Form Fields:**
- **Code** (required): Mã tỉnh thành, lowercase, unique
- **Name** (required): Tên tỉnh thành
- **Slug** (optional): URL slug, auto-generate nếu không nhập
- **Display Order** (number): Thứ tự hiển thị
- **Is Active** (switch): Kích hoạt/ẩn

**Validations:**
- ✅ Code & Name required
- ✅ Code phải unique
- ✅ Slug phải unique (auto-generate nếu trống)
- ✅ Không xóa city đang có branches

### 3. Admin Page

#### **`app/admin/page.tsx`** - Updated

**Changes:**
- ✅ Added `CitiesManager` import
- ✅ Added `MapPin` icon
- ✅ Added "Tỉnh thành" tab (5 tabs total now)
- ✅ Updated TabsList grid: `grid-cols-4` → `grid-cols-5`
- ✅ Updated description: thêm "tỉnh thành"

**New Tab Order:**
1. Tổng quan (Overview)
2. Đặt phòng (Bookings)
3. **Tỉnh thành (Cities)** ← NEW
4. Chi nhánh (Branches)
5. Phòng (Rooms)

---

## 🎯 City Model Schema

```typescript
interface ICity {
  _id: string
  code: string           // Mã: "hcm", "hn", "dn" - unique, lowercase
  name: string           // Tên: "TP. Hồ Chí Minh", "Hà Nội"
  slug: string           // URL: "tp-ho-chi-minh", "ha-noi" - unique
  isActive: boolean      // Kích hoạt: true/false
  displayOrder: number   // Thứ tự: 0, 1, 2...
  createdAt: Date
  updatedAt: Date
}
```

---

## 📡 API Endpoints Summary

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/api/cities` | Lấy danh sách cities (active only) | Public |
| GET | `/api/cities?all=true` | Lấy tất cả cities (admin) | Public |
| POST | `/api/cities` | Tạo city mới | Admin |
| GET | `/api/cities/[id]` | Lấy chi tiết 1 city | Public |
| PUT | `/api/cities/[id]` | Cập nhật city | Admin |
| DELETE | `/api/cities/[id]` | Xóa city | Admin |

---

## 🧪 Testing Guide

### 1. Test Thêm City Mới

**Steps:**
1. Login admin: http://localhost:3000/admin
2. Chuyển tab "Tỉnh thành"
3. Click "Thêm tỉnh thành"
4. Nhập:
   - Code: `danang`
   - Name: `Đà Nẵng`
   - Slug: (để trống - auto)
   - Display Order: `2`
   - Is Active: ✅
5. Click "Tạo mới"

**Expected:**
- ✅ Toast "Tạo tỉnh thành thành công"
- ✅ Table reload, hiện city mới
- ✅ Slug auto: `da-nang`

### 2. Test Sửa City

**Steps:**
1. Click icon ✏️ bên cạnh city
2. Sửa Name: `TP. Đà Nẵng`
3. Click "Cập nhật"

**Expected:**
- ✅ Toast "Cập nhật tỉnh thành thành công"
- ✅ Table reload với name mới

### 3. Test Toggle Active

**Steps:**
1. Click Switch ở cột "Trạng thái"

**Expected:**
- ✅ Toast "Tắt/Bật kích hoạt thành công"
- ✅ Switch toggle ngay lập tức
- ✅ City inactive không hiện ở public (LocationSelector)

### 4. Test Xóa City (Có Branches)

**Steps:**
1. Chọn city "TP. Hồ Chí Minh" (có branches)
2. Click icon 🗑️
3. Confirm xóa

**Expected:**
- ❌ Toast error: "Không thể xóa tỉnh thành đang có X chi nhánh"
- ❌ City KHÔNG bị xóa

### 5. Test Xóa City (Không Có Branches)

**Steps:**
1. Tạo city mới không có branch
2. Click icon 🗑️
3. Confirm xóa

**Expected:**
- ✅ Toast "Xóa tỉnh thành thành công"
- ✅ City biến mất khỏi table

### 6. Test Validation

**Test Case 1: Code trùng**
- Tạo city với code đã tồn tại
- Expected: ❌ Error "Mã tỉnh thành đã tồn tại"

**Test Case 2: Name trống**
- Để trống Name
- Expected: ❌ Error "Code và Name là bắt buộc"

**Test Case 3: Auto-generate slug**
- Nhập Name: "Cần Thơ", để trống Slug
- Expected: ✅ Slug auto: `can-tho`

---

## 🔒 Security & Validation

### API Level
- ✅ **Unique Code**: Kiểm tra trùng lặp code (lowercase)
- ✅ **Unique Slug**: Kiểm tra trùng lặp slug
- ✅ **Required Fields**: Code, Name bắt buộc
- ✅ **Delete Protection**: Không xóa city có branches
- ✅ **Lowercase Enforcement**: Code & slug tự động lowercase

### UI Level
- ✅ **Client Validation**: Required fields check
- ✅ **Loading States**: Disable buttons khi submitting
- ✅ **Error Handling**: Toast messages rõ ràng
- ✅ **Confirmation Dialog**: Xác nhận trước khi xóa

---

## 🎨 UI/UX Features

### Table
- 📊 Sort by displayOrder (tự động)
- 🏷️ Badge cho code (monospace font)
- 🔄 Switch toggle active trực tiếp
- ✏️🗑️ Action buttons compact

### Dialog Form
- 📝 Clear labels với (*) cho required
- 💡 Helper text giải thích
- ✅ Validation feedback
- 🔄 Loading state với spinner

### Toasts
- ✅ Success: Green toast
- ❌ Error: Red toast với message chi tiết
- ⚡ Auto-dismiss sau 3-5s

---

## 🚀 Next Steps (Optional Enhancements)

### Đã Implement ✅
- [x] CRUD API endpoints
- [x] Admin UI component
- [x] Form validation
- [x] Delete protection
- [x] Toggle active
- [x] Auto-generate slug

### Future Enhancements 🔮
- [ ] **Drag & Drop** reorder displayOrder
- [ ] **Bulk Actions** (delete multiple, toggle multiple)
- [ ] **Search/Filter** cities by name/code
- [ ] **Export** cities to CSV/Excel
- [ ] **Import** cities from CSV
- [ ] **Audit Log** track changes history
- [ ] **Soft Delete** thay vì hard delete

---

## 📚 Code Examples

### Tạo City Mới (API Call)
```typescript
const response = await fetch('/api/cities', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    code: 'danang',
    name: 'Đà Nẵng',
    slug: '', // auto-generate
    isActive: true,
    displayOrder: 2,
  }),
})

const data = await response.json()
// { success: true, data: { _id, code, name, slug, ... }, message: "..." }
```

### Xóa City (API Call)
```typescript
const response = await fetch('/api/cities/675abc123def456789', {
  method: 'DELETE',
})

const data = await response.json()
// Success: { success: true, message: "Xóa tỉnh thành thành công" }
// Error: { success: false, error: "Không thể xóa tỉnh thành đang có 3 chi nhánh", branchCount: 3 }
```

---

## ✅ Checklist Hoàn Thành

- [x] POST /api/cities - Create city
- [x] GET /api/cities/[id] - Get city detail
- [x] PUT /api/cities/[id] - Update city
- [x] DELETE /api/cities/[id] - Delete city
- [x] GET /api/cities?all=true - Get all cities (admin)
- [x] CitiesManager component - Full UI
- [x] Admin page tab integration
- [x] Form validation (client + server)
- [x] Delete protection (check branches)
- [x] Auto-generate slug
- [x] Toggle active feature
- [x] Loading states
- [x] Error handling
- [x] Toast notifications
- [x] Confirmation dialogs

---

## 🎉 Kết Luận

**Hoàn thành đầy đủ CRUD cho Cities!**

Admin giờ có thể:
- ✅ Thêm tỉnh thành mới dễ dàng
- ✅ Sửa thông tin tỉnh thành
- ✅ Xóa tỉnh thành (có protection)
- ✅ Toggle active/inactive
- ✅ Quản lý thứ tự hiển thị

**Code quality:**
- ✅ Type-safe với TypeScript
- ✅ Error handling đầy đủ
- ✅ Validation 2 layers (client + server)
- ✅ User-friendly UI/UX
- ✅ Consistent với các manager khác

**Ready for production!** 🚀
