# 🔄 Mock Data Migration to MongoDB - Complete Analysis

**Ngày:** 16/10/2025  
**Mục tiêu:** Migrate TOÀN BỘ mock data sang MongoDB

---

## 📊 Phân tích Files sử dụng Mock Data

### ✅ Files ĐÃ migrate sang MongoDB:

1. ✅ `app/page.tsx` - Homepage
   - Fetch cities từ `/api/cities`
   - Fetch branches từ `/api/branches?cityId=xxx`

2. ✅ `components/location-selector.tsx`
   - Fetch cities và branches từ API

3. ✅ `app/rooms/[branchId]/rooms-client.tsx`
   - Fetch rooms từ `/api/rooms?branchId=xxx`

4. ✅ `app/booking/[roomId]/page.tsx`
   - Fetch room từ `/api/rooms/:id`
   - Fetch bookings từ `/api/bookings`

5. ✅ `components/booking-form.tsx`
   - Fetch combos từ `/api/combos`
   - Fetch menu từ `/api/menu`
   - Create booking qua `/api/bookings`

6. ✅ `components/timeline-booking.tsx`
   - Nhận data từ parent (đã dùng MongoDB)

7. ✅ `components/room-details-panel.tsx`
   - Nhận room data từ parent (đã dùng MongoDB)

### ❌ Files VẪN dùng Mock Data:

1. ❌ `app/rooms/[branchId]/page.tsx`
   - Dùng: `branches.find()` cho metadata
   - Line: 2, 14

2. ❌ `app/payment/page.tsx`
   - Dùng: `rooms.find()` để hiển thị thông tin room
   - Line: 11, 24

3. ❌ `components/admin/branches-manager.tsx`
   - Dùng: `branches`, `cities` cho CRUD
   - Line: 20, 23, 92
   - CRUD chỉ update local state, không save DB

4. ❌ `components/admin/rooms-manager.tsx`
   - Dùng: `rooms`, `branches` cho CRUD
   - Line: 21, 24, 149
   - CRUD chỉ update local state, không save DB

---

## 📋 API Endpoints Status

### ✅ APIs ĐÃ TỒN TẠI:

#### Cities
- ✅ GET `/api/cities` - List all cities
- ✅ GET `/api/cities/:id` - Get city detail

#### Branches  
- ✅ GET `/api/branches` - List branches (filter by cityId)
- ✅ GET `/api/branches/:id` - Get branch detail
- ❌ POST `/api/branches` - Create branch **CHƯA CÓ**
- ❌ PUT/PATCH `/api/branches/:id` - Update branch **CHƯA CÓ**
- ❌ DELETE `/api/branches/:id` - Delete branch **CHƯA CÓ**

#### Rooms
- ✅ GET `/api/rooms` - List rooms (filter by branchId, status)
- ✅ GET `/api/rooms/:id` - Get room detail
- ❌ POST `/api/rooms` - Create room **CHƯA CÓ**
- ❌ PUT/PATCH `/api/rooms/:id` - Update room **CHƯA CÓ**
- ❌ DELETE `/api/rooms/:id` - Delete room **CHƯA CÓ**

#### Bookings
- ✅ GET `/api/bookings` - List bookings (filter by branchId, date, status)
- ✅ GET `/api/bookings/:id` - Get booking detail
- ✅ POST `/api/bookings` - Create booking
- ✅ PATCH `/api/bookings/:id` - Update booking
- ✅ DELETE `/api/bookings/:id` - Delete booking

#### Combos & Menu
- ✅ GET `/api/combos` - List combo packages
- ✅ GET `/api/menu` - List menu items

---

## 🎯 Migration Plan

### Phase 1: Fix Metadata & Info Pages (QUICK WINS)

#### 1.1: `app/rooms/[branchId]/page.tsx`
**Vấn đề:** Dùng mock `branches.find()` cho metadata  
**Giải pháp:** Fetch từ `/api/branches/:id`

```typescript
// BEFORE (Mock)
import { branches } from "@/lib/data"
const branch = branches.find((b) => b.id === branchId)

// AFTER (MongoDB)
const response = await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/branches/${branchId}`)
const { data: branch } = await response.json()
```

#### 1.2: `app/payment/page.tsx`
**Vấn đề:** Dùng mock `rooms.find()` để hiển thị thông tin  
**Giải pháp Option 1:** Nhận `bookingId` thay vì `roomId` từ URL
**Giải pháp Option 2:** Fetch room từ `/api/rooms/:id`

```typescript
// CURRENT URL
?room=xxx&name=xxx&phone=xxx

// BETTER URL (Option 1 - Recommended)
?bookingId=xxx

// Then fetch
const booking = await fetch(`/api/bookings/${bookingId}`)
// Booking includes room, customer info, services, price

// Alternative (Option 2)
const room = await fetch(`/api/rooms/${roomId}`)
```

---

### Phase 2: Admin CRUD Operations (HIGH PRIORITY)

#### 2.1: `components/admin/branches-manager.tsx`
**Vấn đề:** 
- Dùng mock `branches`, `cities`
- CRUD operations chỉ update local state
- Không lưu vào MongoDB

**Giải pháp:**

1. **Initial Load**: Fetch từ API
```typescript
useEffect(() => {
  const loadData = async () => {
    const [branchesRes, citiesRes] = await Promise.all([
      fetch('/api/branches'),
      fetch('/api/cities')
    ])
    setBranches(branchesRes.data)
    setCities(citiesRes.data)
  }
  loadData()
}, [])
```

2. **Create**: POST `/api/branches`
```typescript
const handleCreate = async (data) => {
  const response = await fetch('/api/branches', {
    method: 'POST',
    body: JSON.stringify(data)
  })
  if (response.ok) {
    await refetchBranches() // Reload list
    toast.success('Thêm chi nhánh thành công')
  }
}
```

3. **Update**: PUT `/api/branches/:id`
```typescript
const handleUpdate = async (id, data) => {
  const response = await fetch(`/api/branches/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data)
  })
  if (response.ok) {
    await refetchBranches()
    toast.success('Cập nhật thành công')
  }
}
```

4. **Delete**: DELETE `/api/branches/:id`
```typescript
const handleDelete = async (id) => {
  if (!confirm('Bạn có chắc muốn xóa?')) return
  
  const response = await fetch(`/api/branches/${id}`, {
    method: 'DELETE'
  })
  if (response.ok) {
    await refetchBranches()
    toast.success('Xóa thành công')
  }
}
```

**Cần tạo API:**
- `POST /api/branches`
- `PUT /api/branches/:id`
- `DELETE /api/branches/:id`

#### 2.2: `components/admin/rooms-manager.tsx`
**Vấn đề:** Giống branches-manager

**Giải pháp:** Tương tự như branches-manager

**Cần tạo API:**
- `POST /api/rooms`
- `PUT /api/rooms/:id`
- `DELETE /api/rooms/:id`

---

## 🛠️ Implementation Steps

### Step 1: Tạo CRUD APIs cho Branches (30 phút)

**File:** `app/api/branches/route.ts` (Update)

```typescript
// Thêm POST handler
export async function POST(request: Request) {
  try {
    await connectDB()
    const body = await request.json()

    // Validation
    if (!body.name || !body.cityId || !body.address) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Generate slug
    const slug = body.name
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '')

    const branch = await Branch.create({
      ...body,
      slug,
      isActive: true,
    })

    return NextResponse.json({
      success: true,
      data: branch,
      message: 'Branch created successfully',
    }, { status: 201 })
  } catch (error) {
    console.error('Error creating branch:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to create branch',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}
```

**File:** `app/api/branches/[id]/route.ts` (Update)

```typescript
// Thêm PUT handler
export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    await connectDB()
    const { id } = await params
    const body = await request.json()

    const branch = await Branch.findByIdAndUpdate(
      id,
      { $set: body },
      { new: true, runValidators: true }
    )

    if (!branch) {
      return NextResponse.json(
        { success: false, error: 'Branch not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      data: branch,
      message: 'Branch updated successfully',
    })
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Failed to update branch' },
      { status: 500 }
    )
  }
}

// Thêm DELETE handler
export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    await connectDB()
    const { id } = await params

    // Soft delete: set isActive = false
    const branch = await Branch.findByIdAndUpdate(
      id,
      { isActive: false },
      { new: true }
    )

    if (!branch) {
      return NextResponse.json(
        { success: false, error: 'Branch not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Branch deleted successfully',
    })
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Failed to delete branch' },
      { status: 500 }
    )
  }
}
```

### Step 2: Tạo CRUD APIs cho Rooms (30 phút)

Tương tự như Branches, tạo POST/PUT/DELETE handlers

### Step 3: Migrate app/rooms/[branchId]/page.tsx (10 phút)

Fetch branch từ API cho metadata

### Step 4: Migrate app/payment/page.tsx (15 phút)

Refactor để dùng bookingId thay vì các params riêng lẻ

### Step 5: Migrate components/admin/branches-manager.tsx (45 phút)

Full CRUD với MongoDB

### Step 6: Migrate components/admin/rooms-manager.tsx (45 phút)

Full CRUD với MongoDB

---

## ⏱️ Time Estimates

| Task | Time | Priority |
|------|------|----------|
| Create Branches CRUD APIs | 30 min | HIGH |
| Create Rooms CRUD APIs | 30 min | HIGH |
| Fix RoomsPage metadata | 10 min | MEDIUM |
| Fix PaymentPage | 15 min | MEDIUM |
| Migrate BranchesManager | 45 min | HIGH |
| Migrate RoomsManager | 45 min | HIGH |
| Testing & Bug fixes | 30 min | HIGH |
| **TOTAL** | **3h 25min** | |

---

## ✅ Success Criteria

### Must Have:
- [ ] Không còn import từ `@/lib/data` trong production code
- [ ] Tất cả CRUD operations lưu vào MongoDB
- [ ] Admin managers fetch data từ API
- [ ] Create/Update/Delete hoạt động đúng
- [ ] Toast notifications hiển thị
- [ ] Error handling đầy đủ

### Nice to Have:
- [ ] Optimistic updates trong admin
- [ ] Loading skeletons
- [ ] Confirmation modals
- [ ] Form validation
- [ ] Image upload cho rooms/branches

---

## 🧪 Testing Checklist

### Branches Manager:
- [ ] Load danh sách branches từ MongoDB
- [ ] Create branch mới
- [ ] Update branch info
- [ ] Delete branch (soft delete)
- [ ] Filter by city
- [ ] Error handling

### Rooms Manager:
- [ ] Load danh sách rooms từ MongoDB
- [ ] Create room mới
- [ ] Update room info
- [ ] Delete room
- [ ] Filter by branch
- [ ] Error handling

### Metadata Pages:
- [ ] RoomsPage metadata load đúng branch name
- [ ] PaymentPage load đúng booking/room info

---

## 📝 Notes

### lib/data.ts - Giữ hay Xóa?

**Option 1: Xóa hoàn toàn** ❌
- Pros: Clean, không gây confuse
- Cons: Mất reference types, có thể cần lại cho testing

**Option 2: Giữ lại nhưng rename** ✅ **RECOMMENDED**
- Rename: `lib/data.ts` → `lib/data.types.ts`
- Chỉ export types (interfaces), không export mock data
- Dùng cho TypeScript types trong các components

**Option 3: Move sang folder test** ⚠️
- Move: `lib/data.ts` → `__tests__/fixtures/mock-data.ts`
- Dùng cho unit tests
- Production code không import

**Decision:** Option 2 - Giữ types, xóa mock data

---

## 🎯 Next Steps After Migration

1. **Add Image Upload**
   - Integrate Cloudinary
   - Upload images cho rooms/branches
   - Update model to store image URLs

2. **Add Validation**
   - Form validation với zod
   - API validation
   - Error messages

3. **Add Loading States**
   - Skeleton loaders
   - Optimistic updates
   - Better UX

4. **Add Confirmation Modals**
   - Confirm before delete
   - Confirm before major updates
   - Prevent accidental actions

5. **Add Audit Logging**
   - Log all admin actions
   - Track who changed what
   - Display audit trail

---

## ✨ Summary

**Current Status:**
- ✅ 7/11 components đã dùng MongoDB
- ❌ 4/11 components vẫn dùng mock data

**After Migration:**
- ✅ 11/11 components dùng MongoDB
- ✅ Full CRUD operations
- ✅ Real-time data
- ✅ No more mock data

**Estimated Time:** 3-4 hours  
**Priority:** HIGH  
**Start With:** CRUD APIs → Admin Managers → Metadata Pages
