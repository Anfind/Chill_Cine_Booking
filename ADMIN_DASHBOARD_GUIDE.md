# 🎉 Admin Dashboard - Hướng dẫn sử dụng hoàn chỉnh

## 📊 Tổng quan

Admin Dashboard đã được hoàn thiện với đầy đủ tính năng quản lý hệ thống đặt phòng cinema.

### ✅ Tính năng đã hoàn thành

#### 1. 📈 **Dashboard Tổng quan** (Tab: Tổng quan)
- ✅ Thống kê real-time từ MongoDB
- ✅ 4 metrics chính:
  - 📅 Tổng đặt phòng (so với tháng trước)
  - 💰 Doanh thu tháng này
  - 👥 Số khách hàng unique
  - 📊 Tỷ lệ lấp đầy phòng
- ✅ Danh sách 10 bookings gần nhất
- ✅ Badges trạng thái (pending/confirmed/checked-in/cancelled)
- ✅ Badges thanh toán (unpaid/paid/refunded)

#### 2. 📅 **Quản lý đặt phòng** (Tab: Đặt phòng)
- ✅ Xem danh sách tất cả bookings
- ✅ Bộ lọc đa tiêu chí:
  - 🔍 Tìm kiếm (mã booking, tên, SĐT, phòng)
  - 📊 Filter theo status (pending/confirmed/checked-in/checked-out/cancelled)
  - 💳 Filter theo payment status (unpaid/paid/refunded)
  - 📅 Filter theo ngày
- ✅ Xem chi tiết booking:
  - Thông tin khách hàng
  - Thông tin phòng & chi nhánh
  - Thời gian đặt
  - Menu items đã order
  - Chi tiết giá (room + menu + tax)
- ✅ Cập nhật trạng thái:
  - Pending → Confirmed
  - Confirmed → Checked-in
  - Checked-in → Checked-out
  - Hủy booking bất kỳ lúc nào
- ✅ Loading states & error handling

#### 3. 🏢 **Quản lý chi nhánh** (Tab: Chi nhánh)
- ✅ CRUD hoàn chỉnh (Create, Read, Update, Delete)
- ✅ Chọn tỉnh/thành phố từ database
- ✅ Nhập địa chỉ, số điện thoại
- ✅ Soft delete (isActive=false)
- ✅ Populate city info

#### 4. 🚪 **Quản lý phòng** (Tab: Phòng)
- ✅ CRUD hoàn chỉnh
- ✅ Filter theo branch
- ✅ Chọn room type (Classic/Luxury/VIP)
- ✅ Nhập thông tin:
  - Tên phòng
  - Mô tả
  - Capacity (số người)
  - Price per hour
  - Amenities (tiện ích)
  - Images (URLs)
  - Status (available/maintenance/unavailable)
- ✅ Populate branch & room type info

---

## 🚀 Cách sử dụng

### 1. Khởi động server

```bash
# Đảm bảo MongoDB đang chạy
net start MongoDB

# Chạy dev server
pnpm dev
```

### 2. Truy cập Admin Dashboard

```
URL: http://localhost:3000/admin
```

**Lưu ý:** Hiện tại chưa có authentication, ai cũng có thể truy cập `/admin`. Điều này sẽ được bổ sung ở Phase 2 (NextAuth.js).

---

## 📋 Hướng dẫn từng tính năng

### 📈 Tab: Tổng quan

#### Xem thống kê real-time
1. Mở tab "Tổng quan"
2. Hệ thống tự động fetch stats từ MongoDB
3. Xem 4 metrics:
   - **Tổng đặt phòng:** Số bookings trong tháng này vs tháng trước
   - **Doanh thu:** Tổng tiền từ bookings đã thanh toán (paid)
   - **Khách hàng:** Số khách unique (theo số điện thoại)
   - **Tỷ lệ lấp đầy:** % giờ đã đặt / tổng giờ available

#### Xem bookings gần đây
- Scroll xuống xem 10 bookings mới nhất
- Click vào booking để xem thêm chi tiết (sẽ redirect sang tab Đặt phòng)

---

### 📅 Tab: Đặt phòng

#### Xem danh sách bookings
1. Mở tab "Đặt phòng"
2. Danh sách tất cả bookings được hiển thị

#### Tìm kiếm & Filter
**Tìm kiếm:**
- Nhập mã booking (e.g., `BK20251016001`)
- Nhập tên khách (e.g., `Khách hàng 1`)
- Nhập SĐT (e.g., `0989760000`)
- Nhập tên phòng (e.g., `Cinema Room 00`)

**Filter theo Status:**
- Tất cả
- Chờ xác nhận (pending)
- Đã xác nhận (confirmed)
- Đang sử dụng (checked-in)
- Đã trả phòng (checked-out)
- Đã hủy (cancelled)

**Filter theo Payment:**
- Tất cả
- Chưa thanh toán (unpaid)
- Đã thanh toán (paid)
- Đã hoàn tiền (refunded)

**Filter theo Ngày:**
- Click icon Calendar
- Chọn ngày cụ thể
- Hệ thống hiển thị bookings của ngày đó

**Xóa bộ lọc:**
- Click button "Xóa bộ lọc" để reset tất cả filters

#### Xem chi tiết booking
1. Click button "Chi tiết" trên booking card
2. Dialog popup hiển thị:
   - **Thông tin khách hàng:** Tên, SĐT, Email
   - **Thông tin đặt phòng:** Phòng, Chi nhánh, Thời gian, Combo
   - **Đồ ăn & uống:** Danh sách menu items đã order
   - **Chi tiết giá:** Room, Menu, Tạm tính, Thuế, Giảm giá, Tổng
   - **Trạng thái:** Status, Payment status, Payment method, Ghi chú

#### Cập nhật trạng thái booking
**Trong dialog chi tiết:**
- **Pending → Confirmed:** Click "Xác nhận"
- **Confirmed → Checked-in:** Click "Check-in"
- **Checked-in → Checked-out:** Click "Check-out"
- **Hủy bất kỳ:** Click "Hủy booking"

**Hoặc từ list:**
- Click button "Hủy" ngay trên booking card

**Lưu ý:**
- Không thể update booking đã cancelled hoặc checked-out
- Sau khi update, danh sách tự động refresh

---

### 🏢 Tab: Chi nhánh

#### Thêm chi nhánh mới
1. Click "Thêm chi nhánh"
2. Điền form:
   - **Tên chi nhánh:** (Required) e.g., "Chi nhánh Quận 5"
   - **Tỉnh/Thành phố:** (Required) Chọn từ dropdown
   - **Địa chỉ:** (Required) e.g., "123 Lý Thường Kiệt, Q5, HCM"
   - **Số điện thoại:** (Optional) e.g., "0989760000"
3. Click "Lưu"

#### Sửa chi nhánh
1. Click icon ✏️ Pencil trên branch card
2. Form mở ra với data hiện tại
3. Chỉnh sửa thông tin
4. Click "Lưu"

#### Xóa chi nhánh
1. Click icon 🗑️ Trash trên branch card
2. Confirm xóa
3. Branch được soft delete (isActive = false)

**Lưu ý:**
- Không thể xóa branch nếu còn rooms đang active
- Xóa branch sẽ ẩn luôn tất cả rooms của branch đó

---

### 🚪 Tab: Phòng

#### Filter theo chi nhánh
1. Dropdown "Chi nhánh" ở đầu trang
2. Chọn chi nhánh cụ thể hoặc "Tất cả"
3. Danh sách phòng tự động lọc

#### Thêm phòng mới
1. Click "Thêm phòng"
2. Điền form:
   - **Tên phòng:** (Required) e.g., "Cinema Room 05"
   - **Chi nhánh:** (Required) Chọn từ dropdown
   - **Loại phòng:** (Required) Classic/Luxury/VIP
   - **Mô tả:** (Optional) Mô tả chi tiết phòng
   - **Capacity:** (Required) Số người (1-10)
   - **Giá/giờ:** (Required) e.g., 80000, 100000
   - **Tiện ích:** (Optional) Danh sách ngăn cách bởi dấu phẩy
     - e.g., `Máy chiếu, Netflix, Board game, Ghế sofa`
   - **Images:** (Optional) Mỗi URL 1 dòng
     ```
     /modern-meeting-room.png
     /modern-conference-room.png
     ```
   - **Status:** available/maintenance/unavailable
3. Click "Lưu"

#### Sửa phòng
1. Click icon ✏️ Pencil trên room card
2. Form mở ra với data hiện tại
3. Chỉnh sửa thông tin
4. Click "Lưu"

#### Xóa phòng
1. Click icon 🗑️ Trash trên room card
2. Confirm xóa
3. Room được soft delete (isActive = false)

**Lưu ý:**
- Không thể xóa phòng nếu còn bookings active
- Phòng bị xóa sẽ không hiển thị trong booking form

---

## 🎨 UI Features

### Loading States
- ⏳ Skeleton loading khi fetch data
- 🔄 Spinner icon trên buttons khi submit
- 🚫 Disable buttons khi đang loading

### Error Handling
- ❌ Toast notifications cho errors
- ✅ Toast notifications cho success
- 🔴 Error messages inline trong forms

### Responsive Design
- 📱 Mobile-friendly
- 💻 Tablet & Desktop optimized
- 🎯 Touch-optimized buttons

### Badges
**Status Badges:**
- 🟡 Pending (outline)
- ✅ Confirmed (default/green)
- 🟢 Checked-in (secondary)
- ⚫ Checked-out (secondary)
- 🔴 Cancelled (destructive/red)

**Payment Badges:**
- ⏳ Unpaid (outline)
- ✅ Paid (default/green)
- 💵 Refunded (secondary)

---

## 🔢 Số liệu thống kê

### Từ seed data hiện tại:
```
📊 Dashboard Stats (tháng 10/2025):
- Tổng bookings: 13
- Doanh thu: ~3,000,000 VNĐ (10 bookings paid)
- Khách hàng: 13 unique customers
- Tỷ lệ lấp đầy: ~2-5% (52 giờ / ~21,000 giờ available)

📅 Bookings:
- Hôm nay (16/10): 5 bookings
  - 2 confirmed + paid
  - 2 checked-in + unpaid
  - 1 pending + unpaid
- Ngày mai (17/10): 8 bookings
  - All confirmed + paid

🏢 Branches: 7
- HCM: 3 branches
- HN: 2 branches
- ĐN: 1 branch
- CT: 1 branch

🚪 Rooms: 28
- Classic: 14 rooms (2 per branch)
- Luxury: 14 rooms (2 per branch)
```

---

## 🎯 Best Practices

### Quản lý Bookings
1. ✅ Xác nhận bookings pending ngay khi nhận được
2. 🟢 Check-in khách đúng giờ
3. ⚫ Check-out và đánh dấu hoàn thành
4. 🔴 Hủy bookings với lý do rõ ràng

### Quản lý Branches & Rooms
1. ✅ Đảm bảo thông tin branch đầy đủ (địa chỉ, SĐT)
2. ✅ Cập nhật status phòng (maintenance khi sửa chữa)
3. ✅ Upload hình ảnh chất lượng cao
4. ✅ Liệt kê đầy đủ amenities

### Data Quality
1. ✅ Không xóa branch/room có bookings active
2. ✅ Update payment status ngay khi nhận tiền
3. ✅ Ghi chú rõ ràng cho bookings đặc biệt
4. ✅ Check conflict trước khi confirm booking

---

## 🐛 Troubleshooting

### Không load được stats
**Triệu chứng:** Dashboard hiển thị "Không có dữ liệu"

**Giải pháp:**
```bash
# 1. Check MongoDB running
net start MongoDB

# 2. Check có bookings trong DB
mongosh
use chill-cine-hotel
db.bookings.countDocuments()  # Should be > 0

# 3. Restart server
pnpm dev
```

### Không update được booking status
**Triệu chứng:** Toast error "Không thể cập nhật trạng thái"

**Giải pháp:**
1. Check server console logs
2. Verify booking ID đúng
3. Verify status transition hợp lệ:
   - pending → confirmed ✅
   - confirmed → checked-in ✅
   - checked-in → checked-out ✅
   - checked-out → confirmed ❌ (không thể revert)
   - cancelled → any ❌ (không thể revert)

### Filter không hoạt động
**Triệu chứng:** Chọn filter nhưng không có kết quả

**Giải pháp:**
1. Click "Xóa bộ lọc"
2. Thử lại từng filter riêng lẻ
3. Check data format (date phải đúng định dạng)
4. Refresh trang (F5)

---

## 🔮 Tính năng sẽ bổ sung

### Phase 2 (High Priority):
- [ ] 🔐 Authentication (NextAuth.js)
  - Admin login/logout
  - Role-based access (admin/staff)
  - Session management
- [ ] 📊 Analytics Charts (Recharts)
  - Revenue chart by day/month
  - Booking trends
  - Room occupancy heatmap
- [ ] 💰 Combo & Menu Management
  - CRUD combo packages
  - CRUD menu items
  - Bulk edit prices

### Phase 3 (Medium Priority):
- [ ] 👥 User Management
  - List all customers
  - View booking history per customer
  - Customer loyalty program
- [ ] 📱 Notifications
  - Email bookings confirmations
  - SMS reminders
  - Push notifications
- [ ] 📄 Export Reports
  - PDF invoices
  - Excel reports
  - Revenue reports

### Phase 4 (Low Priority):
- [ ] 🔍 Audit Logs
  - Track all admin actions
  - View change history
  - Rollback changes
- [ ] 🎨 Customization
  - Dark mode
  - Custom themes
  - Personalize dashboard

---

## 📞 Support

Nếu gặp vấn đề, check:
1. Server logs trong terminal
2. Browser console (F12)
3. MongoDB logs
4. File `BOOKINGS_GUIDE.md` để hiểu data structure
5. File `DATABASE_SCHEMA.md` để hiểu database design

---

## 🎉 Kết luận

Admin Dashboard đã hoàn thiện với:
- ✅ 4 tabs chính năng
- ✅ Real-time statistics
- ✅ Full CRUD operations
- ✅ Advanced filters
- ✅ Status management
- ✅ Responsive UI
- ✅ Error handling

**Bạn đã sẵn sàng quản lý hệ thống Chill Cine Booking! 🚀**

---

*Last updated: October 16, 2025*
*Version: 2.0*
