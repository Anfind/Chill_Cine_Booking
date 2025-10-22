# 🎉 Hệ thống Quản lý Combo & Dịch vụ thêm

## 📅 Ngày: 22/10/2025 - 22:00 (GMT+7)

---

## ✨ Tổng quan

Đã tạo hoàn chỉnh hệ thống quản lý **Combo Packages** (gói combo theo giờ) và **Menu Items** (đồ ăn, đồ uống, dịch vụ thêm) trong Admin Panel.

---

## 🗂️ Cấu trúc Files

### 1. Models (Đã có sẵn)
```
lib/models/
├── ComboPackage.ts   ✅ Đã có
└── MenuItem.ts       ✅ Đã có
```

### 2. API Endpoints (Mới tạo)
```
app/api/
├── combos/
│   ├── route.ts                 ✅ GET, POST
│   └── [comboId]/route.ts       ✅ GET, PUT, DELETE
└── menu-items/
    ├── route.ts                 ✅ GET, POST
    └── [itemId]/route.ts        ✅ GET, PUT, DELETE
```

### 3. Admin Components (Mới tạo)
```
components/admin/
├── combos-manager.tsx           ✅ CRUD Combo
└── menu-items-manager.tsx       ✅ CRUD Menu Items
```

### 4. Admin Page (Đã cập nhật)
```
app/admin/page.tsx               ✅ Thêm 2 tabs mới
```

---

## 📊 Schema Details

### ComboPackage Schema
```typescript
interface IComboPackage {
  name: string              // Tên combo (VD: "Combo 2 giờ")
  code: string              // Mã combo (unique, lowercase)
  duration: number          // Thời gian (giờ)
  price: number             // Giá tiền
  description: string       // Mô tả
  isSpecial: boolean        // Combo đặc biệt
  timeRange?: {             // Khung giờ áp dụng (optional)
    start: string           // VD: "08:00"
    end: string             // VD: "22:00"
  }
  extraFeePerHour: number   // Phụ phí khi vượt giờ
  isActive: boolean         // Hiển thị/ẩn
  displayOrder: number      // Thứ tự sắp xếp
}
```

**Ví dụ:**
```json
{
  "name": "Combo 2 giờ",
  "code": "combo-2h",
  "duration": 2,
  "price": 200000,
  "description": "Gói 2 giờ tiết kiệm cho 2 người",
  "isSpecial": false,
  "timeRange": {
    "start": "08:00",
    "end": "22:00"
  },
  "extraFeePerHour": 50000,
  "isActive": true,
  "displayOrder": 1
}
```

### MenuItem Schema
```typescript
interface IMenuItem {
  name: string                                    // Tên món
  price: number                                   // Giá tiền
  category: 'drink' | 'snack' | 'food' | 'extra' // Loại
  image: string                                   // URL hình ảnh
  description: string                             // Mô tả
  isAvailable: boolean                            // Còn hàng/hết hàng
  displayOrder: number                            // Thứ tự hiển thị
}
```

**Categories:**
- `drink`: Đồ uống (Coffee, Tea, Soda...)
- `snack`: Snack (Khoai tây, Popcorn...)
- `food`: Đồ ăn (Pizza, Burger...)
- `extra`: Dịch vụ thêm (Trang trí, DJ...)

**Ví dụ:**
```json
{
  "name": "Coca Cola",
  "price": 15000,
  "category": "drink",
  "image": "https://example.com/coca.jpg",
  "description": "Lon 330ml",
  "isAvailable": true,
  "displayOrder": 1
}
```

---

## 🔌 API Endpoints

### Combo Packages

#### GET /api/combos
Lấy danh sách tất cả combo (admin xem cả inactive)

**Response:**
```json
{
  "success": true,
  "data": [...],
  "count": 5
}
```

#### POST /api/combos
Tạo combo mới

**Request Body:**
```json
{
  "name": "Combo 3 giờ",
  "code": "combo-3h",
  "duration": 3,
  "price": 280000,
  "description": "Gói 3 giờ cho nhóm bạn",
  "isSpecial": false,
  "extraFeePerHour": 50000,
  "displayOrder": 2,
  "isActive": true
}
```

#### GET /api/combos/[comboId]
Lấy thông tin 1 combo

#### PUT /api/combos/[comboId]
Cập nhật combo

#### DELETE /api/combos/[comboId]
Xóa combo (soft delete - set `isActive=false`)

---

### Menu Items

#### GET /api/menu-items?category=drink
Lấy danh sách menu items (có thể filter theo category)

**Query params:**
- `category`: drink | snack | food | extra (optional)

**Response:**
```json
{
  "success": true,
  "data": [...],
  "count": 12,
  "filters": { "category": "drink" }
}
```

#### POST /api/menu-items
Tạo menu item mới

**Request Body:**
```json
{
  "name": "Pepsi",
  "price": 15000,
  "category": "drink",
  "image": "https://example.com/pepsi.jpg",
  "description": "Lon 330ml",
  "displayOrder": 2,
  "isAvailable": true
}
```

#### GET /api/menu-items/[itemId]
Lấy thông tin 1 menu item

#### PUT /api/menu-items/[itemId]
Cập nhật menu item

#### DELETE /api/menu-items/[itemId]
Xóa menu item (soft delete - set `isAvailable=false`)

---

## 🎨 Admin UI Features

### Combos Manager (`/admin` → Tab "Combo")

**Features:**
- ✅ Danh sách combo với card layout
- ✅ Badge hiển thị: Code, Đặc biệt, Đã ẩn
- ✅ Thông tin: Tên, Thời gian, Giá, Khung giờ, Phụ phí
- ✅ Dialog form với tất cả fields
- ✅ Toggle switches: Combo đặc biệt, Khung giờ, Active
- ✅ Time range inputs (chỉ hiện khi bật "Khung giờ")
- ✅ Validation: Required fields, unique code
- ✅ Toast notifications
- ✅ CRUD đầy đủ

**UI Components:**
- Card list với gradient borders
- Badge cho status (Special, Inactive)
- Icons: Clock, DollarSign, Star
- Switch toggles
- Time inputs (HH:mm format)

---

### Menu Items Manager (`/admin` → Tab "Dịch vụ")

**Features:**
- ✅ Grid layout (3 columns trên desktop)
- ✅ Filter theo category (dropdown)
- ✅ Icon theo loại: Coffee (drink), Cookie (snack), Utensils (food), Gift (extra)
- ✅ Badge hiển thị: Category, Hết hàng
- ✅ Dialog form với category select
- ✅ Image URL input
- ✅ Toggle: Còn hàng
- ✅ CRUD đầy đủ

**UI Components:**
- Grid cards với icon
- Category filter dropdown
- Badge cho category và availability
- Icons: Coffee, Cookie, UtensilsCrossed, Gift
- Switch toggle (Còn hàng)

---

## 🎯 Use Cases

### Combo Packages
1. **Combo giờ cố định**
   - Combo 2h: 200,000đ
   - Combo 3h: 280,000đ
   - Combo 4h: 350,000đ

2. **Combo theo khung giờ**
   - Combo sáng (8h-12h): Giảm 20%
   - Combo tối (18h-23h): Giá thường

3. **Combo đặc biệt**
   - Weekend combo
   - Holiday package
   - Birthday special

### Menu Items
1. **Đồ uống (Drink)**
   - Coca Cola: 15,000đ
   - Pepsi: 15,000đ
   - Trà xanh: 20,000đ
   - Cà phê: 25,000đ

2. **Snack**
   - Popcorn: 30,000đ
   - Khoai tây chiên: 35,000đ
   - Bánh quy: 20,000đ

3. **Đồ ăn (Food)**
   - Pizza: 150,000đ
   - Burger: 80,000đ
   - Mì ý: 120,000đ

4. **Dịch vụ thêm (Extra)**
   - Trang trí sinh nhật: 200,000đ
   - DJ riêng: 500,000đ
   - Máy chiếu 4K: 100,000đ

---

## 📱 Admin Page Updates

**Before:**
```
Tabs: [Tổng quan] [Đặt phòng] [Tỉnh thành] [Chi nhánh] [Phòng]
```

**After:**
```
Tabs: [Tổng quan] [Đặt phòng] [Tỉnh thành] [Chi nhánh] [Phòng] [Combo] [Dịch vụ]
```

**Changes:**
- Grid layout: `grid-cols-5` → `grid-cols-7`
- Added icons: `Package`, `Coffee`
- Responsive: Icons visible on mobile, text on desktop

---

## ✅ Testing Checklist

### Combo Management
- [ ] GET /api/combos → Lấy danh sách
- [ ] POST /api/combos → Tạo combo mới
- [ ] PUT /api/combos/[id] → Cập nhật combo
- [ ] DELETE /api/combos/[id] → Xóa combo (soft delete)
- [ ] Form validation: Required fields
- [ ] Code uniqueness check
- [ ] Time range toggle (show/hide inputs)
- [ ] Special combo badge display
- [ ] Inactive combo badge

### Menu Items Management
- [ ] GET /api/menu-items → Lấy tất cả
- [ ] GET /api/menu-items?category=drink → Filter
- [ ] POST /api/menu-items → Tạo item mới
- [ ] PUT /api/menu-items/[id] → Cập nhật item
- [ ] DELETE /api/menu-items/[id] → Xóa item (soft delete)
- [ ] Category filter working
- [ ] Category icons display correctly
- [ ] Image URL validation
- [ ] Availability toggle

### UI/UX
- [ ] Admin tabs hiển thị đầy đủ (7 tabs)
- [ ] Icons hiển thị đúng
- [ ] Responsive layout (mobile/desktop)
- [ ] Dialog forms mở/đóng đúng
- [ ] Toast notifications
- [ ] Loading states

---

## 🔮 Future Enhancements

### 1. Combo Suggestions
```typescript
// Auto-suggest combo based on duration
GET /api/combos/suggest?duration=3
// Returns combos with duration >= 3 hours
```

### 2. Combo + Menu Items Bundle
```typescript
// Package combo with menu items
{
  "combo": "combo-3h",
  "menuItems": ["coca-cola", "popcorn"],
  "totalPrice": 280000 + 15000 + 30000
}
```

### 3. Dynamic Pricing
```typescript
// Giá thay đổi theo giờ/ngày
{
  "basePrice": 200000,
  "peakHourMultiplier": 1.2,  // 18h-23h
  "weekendMultiplier": 1.5     // T7, CN
}
```

### 4. Inventory Management
```typescript
// Track stock for menu items
{
  "currentStock": 50,
  "minStock": 10,
  "autoReorder": true
}
```

### 5. Popular Items Analytics
```typescript
// Track most ordered items
GET /api/analytics/popular-items
// Returns top 10 menu items by order count
```

---

## 📝 Summary

| Feature | Status | Files Created | Lines of Code |
|---------|--------|---------------|---------------|
| Combo API | ✅ Done | 2 files | ~340 LOC |
| Menu Items API | ✅ Done | 2 files | ~350 LOC |
| Combos Manager UI | ✅ Done | 1 file | ~450 LOC |
| Menu Items Manager UI | ✅ Done | 1 file | ~400 LOC |
| Admin Page Integration | ✅ Done | Updated | +20 LOC |

**Total:** 7 files, ~1560 lines of code

**Result:** Hệ thống quản lý Combo & Dịch vụ hoàn chỉnh! 🎉

---

## 🚀 Next Steps

1. **Test CRUD operations** trong admin panel
2. **Add sample data** (seed combos và menu items)
3. **Integrate với booking flow** (chọn combo khi đặt phòng)
4. **Add images** cho menu items
5. **Create public API** để user xem combo/menu (không cần auth)

Hệ thống đã sẵn sàng! Bạn có thể vào `/admin` và test 2 tabs mới: **Combo** và **Dịch vụ** 🎊
