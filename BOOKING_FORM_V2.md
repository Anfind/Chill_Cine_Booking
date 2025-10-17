# 📝 Booking Form V2 - Redesigned

**Ngày:** 17 Oct 2025  
**Inspiration:** Thiết kế từ choncinehome.com  
**Mục tiêu:** Form thân thiện, khoa học, 2 bước rõ ràng

---

## 🎯 Design Goals

### Before (Form V1):
- ❌ Một màn hình dài, scroll nhiều
- ❌ Không có step indicator
- ❌ Không thể đổi phòng
- ❌ Không có combo selection
- ❌ Không có "Thêm giờ" flexible
- ❌ Phải nhập manual startTime/endTime

### After (Form V2):
- ✅ 2 bước rõ ràng (Phòng/Thời gian → Thông tin khách)
- ✅ Step indicator visual
- ✅ Dropdown đổi phòng cùng chi nhánh
- ✅ Combo selection grid (radio buttons)
- ✅ "Thêm giờ" với +/- buttons
- ✅ Auto-calculate endTime, duration, price
- ✅ Real-time price display
- ✅ Mobile responsive

---

## 📱 UI Structure

### Header
```
┌────────────────────────────────────────┐
│ Đặt phòng                          [X] │ ← Gradient background
│ [1] ──────────── [2]                   │ ← Step indicator
└────────────────────────────────────────┘
```

### Step 1: Room & Time Selection

```
┌────────────────────────────────────────┐
│ Bước 1: Chọn phòng và thời gian       │
│ Vui lòng chọn phòng và thời gian...   │
├────────────────────────────────────────┤
│ ⚠️ Lưu ý: Mỗi booking phải cách nhau   │
│    tối thiểu 15 phút.                  │
├────────────────────────────────────────┤
│ Hạng phòng          │ Phòng            │
│ [Vip      ]         │ [P104 ▼]         │ ← Dropdown
├────────────────────────────────────────┤
│ Chọn combo                             │
│ ┌──────────┬──────────┐               │
│ │ ○ 2 giờ  │ ○ 4 giờ  │               │ ← Radio grid
│ ├──────────┼──────────┤               │
│ │ ○ 6 giờ  │ ○ 10 giờ │               │
│ ├──────────┼──────────┤               │
│ │ ○ Qua Đêm│ ○ Ngày   │               │
│ └──────────┴──────────┘               │
├────────────────────────────────────────┤
│ Thời gian nhận                         │
│ [📅 17/10/2025] [18h ▼] [00 ▼]       │
│                                        │
│ Thêm giờ            [-] 1 [+]         │ ← Add hours
│                                        │
│ Thời gian trả                          │
│ [17/10/2025      ] [20h   ]           │ ← Auto calculated
├────────────────────────────────────────┤
│ Thời gian: 2 giờ    Tổng: 199.000    │ ← Summary
├────────────────────────────────────────┤
│ [Hủy]              [Tiếp tục]         │
└────────────────────────────────────────┘
```

### Step 2: Customer Information

```
┌────────────────────────────────────────┐
│ Bước 2: Thông tin khách hàng          │
│ Vui lòng điền thông tin liên hệ       │
├────────────────────────────────────────┤
│ Họ và tên *                            │
│ [Nguyễn Văn A          ]              │
│                                        │
│ Số điện thoại *                        │
│ [0987654321            ]              │
│                                        │
│ Email (tùy chọn)                       │
│ [email@example.com     ]              │
├────────────────────────────────────────┤
│ Tóm tắt booking                        │
│ Phòng: P104 - VIP 1                   │
│ Thời gian: 18:00 17/10/2025           │
│ Thời lượng: 2 giờ                     │
│ ─────────────────────────────          │
│ Tổng tiền: 199.000đ                   │
├────────────────────────────────────────┤
│ [Quay lại]         [Xác nhận đặt]     │
└────────────────────────────────────────┘
```

---

## 🔧 Technical Implementation

### Component: `BookingFormV2`

**File:** `components/booking-form-v2.tsx`

**State Management:**
```typescript
// Step control
const [currentStep, setCurrentStep] = useState(1) // 1 or 2

// Step 1 states
const [room, setRoom] = useState(initialRoom)
const [availableRooms, setAvailableRooms] = useState<Room[]>([])
const [selectedCombo, setSelectedCombo] = useState<string | null>(null)
const [date, setDate] = useState<Date>(selectedDate || new Date())
const [startHour, setStartHour] = useState(14)
const [startMinute, setStartMinute] = useState(0)
const [additionalHours, setAdditionalHours] = useState(0)

// Step 2 states
const [customerName, setCustomerName] = useState("")
const [customerPhone, setCustomerPhone] = useState("")
const [customerEmail, setCustomerEmail] = useState("")
```

**Key Features:**

### 1. Room Selector (Dropdown)
```typescript
<Select value={room._id} onValueChange={handleRoomChange}>
  <SelectContent>
    {availableRooms.map((r) => (
      <SelectItem key={r._id} value={r._id}>
        {r.code} - {r.name}
      </SelectItem>
    ))}
  </SelectContent>
</Select>
```

**Logic:**
- Load tất cả rooms trong cùng chi nhánh
- User có thể đổi phòng trước khi book
- Room type hiển thị readonly

### 2. Combo Selection (Radio Grid)
```typescript
<div className="grid grid-cols-2 gap-3">
  {combos.map((combo) => (
    <label className={cn(
      "flex items-center gap-2 p-3 border-2 rounded-lg",
      selectedCombo === combo._id 
        ? "border-pink-500 bg-pink-50" 
        : "border-gray-200"
    )}>
      <input
        type="radio"
        name="combo"
        value={combo._id}
        checked={selectedCombo === combo._id}
        onChange={() => setSelectedCombo(combo._id)}
      />
      <span>{combo.name}</span>
    </label>
  ))}
</div>
```

**Combos:**
- Combo 2 giờ
- Combo 4 giờ
- Combo 6 giờ
- Combo 10 giờ
- Combo Qua Đêm (21h-12h hôm sau)
- Combo Ngày (14h-12h hôm sau)

### 3. Add Hours Feature
```typescript
<div className="flex items-center gap-2">
  <Button onClick={() => setAdditionalHours(Math.max(0, additionalHours - 1))}>
    <Minus />
  </Button>
  <span>{additionalHours}</span>
  <Button onClick={() => setAdditionalHours(additionalHours + 1)}>
    <Plus />
  </Button>
</div>
```

**Logic:**
- Base duration = combo.duration (e.g., 2 giờ)
- Additional hours = user clicks +/-
- Total duration = base + additional
- Price = combo.price + (additional × pricePerHour)

### 4. Auto Calculate End Time
```typescript
const calculateEndTime = () => {
  const combo = combos.find(c => c._id === selectedCombo)
  if (!combo) return null

  const start = new Date(date)
  start.setHours(startHour, startMinute, 0, 0)

  const totalHours = combo.duration + additionalHours
  const end = new Date(start)
  end.setHours(start.getHours() + totalHours)

  return { start, end, totalHours }
}
```

**Updates:**
- User changes startTime → endTime auto updates
- User adds hours → endTime auto updates
- User changes combo → endTime auto updates

### 5. Real-time Price Calculation
```typescript
const calculateTotalPrice = () => {
  const combo = combos.find(c => c._id === selectedCombo)
  if (!combo) return 0

  const additionalPrice = additionalHours * room.pricePerHour
  return combo.price + additionalPrice
}
```

**Display:**
```
Combo 4 giờ: 300.000đ
Thêm 2 giờ:  200.000đ (100.000đ × 2)
─────────────────────
Tổng:        500.000đ
```

---

## ✅ Validation Rules

### Step 1 Validation:
```typescript
const validateStep1 = () => {
  // 1. Must select combo
  if (!selectedCombo) {
    toast.error('Vui lòng chọn combo')
    return false
  }

  // 2. Must select date
  if (!date) {
    toast.error('Vui lòng chọn ngày')
    return false
  }

  // 3. Start time >= now + 5 minutes
  const now = new Date()
  const minBookingTime = new Date(now.getTime() + 5 * 60 * 1000)
  if (timeCalc.start < minBookingTime) {
    toast.error('Không thể đặt phòng cho giờ quá khứ')
    return false
  }

  // 4. End time > Start time
  if (timeCalc.end <= timeCalc.start) {
    toast.error('Giờ kết thúc phải sau giờ bắt đầu')
    return false
  }

  // 5. Duration >= 1 hour
  if (timeCalc.totalHours < 1) {
    toast.error('Thời gian thuê tối thiểu 1 giờ')
    return false
  }

  return true
}
```

### Step 2 Validation:
```typescript
const validateStep2 = () => {
  // 1. Must have name
  if (!customerName.trim()) {
    toast.error('Vui lòng nhập tên khách hàng')
    return false
  }

  // 2. Must have phone
  if (!customerPhone.trim()) {
    toast.error('Vui lòng nhập số điện thoại')
    return false
  }

  // 3. Phone format (10-11 digits)
  const phoneRegex = /^[0-9]{10,11}$/
  if (!phoneRegex.test(customerPhone.trim())) {
    toast.error('Số điện thoại không hợp lệ (10-11 số)')
    return false
  }

  return true
}
```

---

## 🎨 Styling & UX

### Color Scheme:
- **Primary:** Pink/Purple gradient (`from-pink-500 to-purple-500`)
- **Accent:** Pink 600 for text highlights
- **Borders:** Pink 500 for selected states
- **Background:** Gray 50 for sections

### Interactive States:
```typescript
// Radio button selected
className={cn(
  "border-2 rounded-lg",
  selected ? "border-pink-500 bg-pink-50" : "border-gray-200"
)}

// Button hover
className="hover:bg-pink-100"

// Step indicator
className={cn(
  "rounded-full",
  active ? "bg-white text-pink-500" : "bg-white/30 text-white"
)}
```

### Mobile Responsive:
- Grid layout adapts: `grid-cols-2` → `grid-cols-1` on small screens
- Touch-friendly button sizes: `min-h-12`
- Readable font sizes: `text-sm` to `text-base`
- Adequate spacing: `gap-3` to `gap-4`

---

## 🔄 User Flow

### Flow Diagram:
```
┌─────────────────┐
│ Timeline View   │
│ User clicks slot│
└────────┬────────┘
         ↓
┌─────────────────┐
│   Step 1/2      │
│ Room & Time     │
│                 │
│ - Chọn phòng    │
│ - Chọn combo    │
│ - Chọn giờ      │
│ - Thêm giờ      │
│                 │
│ [Tiếp tục] →    │
└────────┬────────┘
         ↓
┌─────────────────┐
│   Step 2/2      │
│ Customer Info   │
│                 │
│ - Tên           │
│ - SĐT           │
│ - Email         │
│                 │
│ [Xác nhận] →    │
└────────┬────────┘
         ↓
┌─────────────────┐
│ Create Booking  │
│ API Call        │
└────────┬────────┘
         ↓
┌─────────────────┐
│ Payment Page    │
│ /payment?id=... │
└─────────────────┘
```

---

## 🧪 Test Cases

### Test 1: Room Selection
```
1. Mở form
2. Click dropdown "Phòng"
3. Chọn phòng khác (P105)

Expected:
- ✅ Room name updates
- ✅ Room code updates
- ✅ Price recalculates if different room type
```

### Test 2: Combo Selection
```
1. Select "Combo 2 giờ"
2. Select "Combo 4 giờ"

Expected:
- ✅ Radio button switches
- ✅ End time auto updates
- ✅ Price updates to combo price
- ✅ Duration displays correctly
```

### Test 3: Add Hours
```
1. Select "Combo 2 giờ" (base: 2h)
2. Click [+] 3 times (additional: 3h)
3. Click [-] 1 time (additional: 2h)

Expected:
- ✅ Counter shows: 0 → 1 → 2 → 3 → 2
- ✅ End time: 16:00 → 17:00 → 18:00 → 19:00 → 18:00
- ✅ Duration: 2h → 3h → 4h → 5h → 4h
- ✅ Price: combo + (additional × pricePerHour)
```

### Test 4: Step Navigation
```
1. Fill step 1, click "Tiếp tục"
2. See step 2
3. Click "Quay lại"

Expected:
- ✅ Step indicator updates (1 → 2 → 1)
- ✅ Form data persists (not reset)
- ✅ Validation runs on "Tiếp tục"
```

### Test 5: Validation
```
Step 1:
- No combo selected → Click "Tiếp tục"
  ✅ Toast: "Vui lòng chọn combo"

- Select past time → Click "Tiếp tục"
  ✅ Toast: "Không thể đặt phòng cho giờ quá khứ"

Step 2:
- Empty name → Click "Xác nhận"
  ✅ Toast: "Vui lòng nhập tên khách hàng"

- Invalid phone "123" → Click "Xác nhận"
  ✅ Toast: "Số điện thoại không hợp lệ (10-11 số)"
```

---

## 📊 Comparison

| Feature | Form V1 | Form V2 |
|---------|---------|---------|
| **Steps** | 1 long form | 2 clear steps |
| **Room selector** | ❌ Fixed room | ✅ Dropdown |
| **Combo selection** | ❌ None | ✅ Radio grid |
| **Add hours** | ❌ Manual input | ✅ +/- buttons |
| **Auto calculate** | ❌ Manual | ✅ Real-time |
| **Step indicator** | ❌ None | ✅ Visual (1, 2) |
| **Mobile UX** | ⚠️ OK | ✅ Optimized |
| **Price display** | At end | Real-time |
| **Validation** | Basic | Comprehensive |

---

## ✅ Summary

**Implemented:**
- ✅ 2-step wizard with visual indicator
- ✅ Room dropdown selector (same branch)
- ✅ Combo grid selection (radio buttons)
- ✅ "Thêm giờ" feature (+/- buttons)
- ✅ Auto-calculate endTime, duration, price
- ✅ Real-time price display
- ✅ Step validation
- ✅ Mobile responsive
- ✅ Alert box for 15-minute gap rule

**Files:**
- ✅ `components/booking-form-v2.tsx` (new)
- ✅ `app/booking/[roomId]/page.tsx` (updated)

**Ready for production!** 🎉
