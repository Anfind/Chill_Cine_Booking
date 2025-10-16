# 🧪 Testing Guide - Mock Data Migration

## Quick Test Steps

### 1. Prerequisites
- ✅ MongoDB running on `localhost:27017`
- ✅ Dev server running (`npm run dev`)
- ✅ Database: `chill-cine-hotel`

### 2. Test Admin Dashboard

#### Access Admin Page:
```
http://localhost:3001/admin
```

---

## Test Scenarios

### A. Branches Manager

#### Test 1: View Branches
1. Navigate to `/admin`
2. You should see the "Quản lý chi nhánh" section
3. Verify branches are loaded from MongoDB (not mock data)
4. If empty, add some test branches

#### Test 2: Create Branch
1. Click "Thêm chi nhánh" button
2. Fill in form:
   - Tên: "Chi nhánh Test"
   - Tỉnh thành: Select any city
   - Địa chỉ: "123 Test Street"
   - SĐT: "0901234567"
3. Click "Thêm"
4. ✅ Should see success toast
5. ✅ New branch appears in list
6. ✅ Check MongoDB to verify data is saved

#### Test 3: Edit Branch
1. Click pencil icon on any branch
2. Change name to "Chi nhánh Updated"
3. Click "Cập nhật"
4. ✅ Should see success toast
5. ✅ Branch name updates in list
6. ✅ Check MongoDB to verify update

#### Test 4: Delete Branch
1. Click trash icon on a branch
2. Confirm deletion
3. ✅ Should see success toast
4. ✅ Branch disappears from list
5. ✅ Check MongoDB - should have `isActive: false`

---

### B. Rooms Manager

#### Test 1: View Rooms
1. Scroll down to "Quản lý phòng" section
2. Verify rooms are loaded from MongoDB
3. Test branch filter dropdown

#### Test 2: Create Room
1. Click "Thêm phòng" button
2. Fill in form:
   - Tên phòng: "P101"
   - Chi nhánh: Select any branch
   - Loại phòng: Select any type
   - Sức chứa: 4
   - Giá/giờ: 50000
   - Mô tả: "Phòng test"
   - Tiện ích: "WiFi, Máy lạnh, TV"
   - Hình ảnh: (optional)
   - Trạng thái: Sẵn sàng
3. Click "Thêm"
4. ✅ Should see success toast
5. ✅ New room appears in list
6. ✅ Check MongoDB to verify data

#### Test 3: Edit Room
1. Click pencil icon on any room
2. Change capacity to 6
3. Change price to 60000
4. Click "Cập nhật"
5. ✅ Should see success toast
6. ✅ Room updates in list

#### Test 4: Delete Room
1. Click trash icon on a room
2. Confirm deletion
3. ✅ Should see success toast
4. ✅ Room disappears from list

#### Test 5: Branch Filter
1. Select a branch from filter dropdown
2. ✅ Only rooms from that branch should show
3. Select "Tất cả chi nhánh"
4. ✅ All rooms should show

---

## Verify Database Persistence

### Check MongoDB:
```bash
# Connect to MongoDB
mongosh

# Use database
use chill-cine-hotel

# Check branches
db.branches.find().pretty()

# Check rooms
db.rooms.find().pretty()

# Verify soft delete (should see isActive: false)
db.branches.find({ isActive: false }).pretty()
db.rooms.find({ isActive: false }).pretty()
```

---

## API Testing (Optional)

### Test with Postman/Thunder Client:

#### Get Branches:
```
GET http://localhost:3001/api/branches
```

#### Create Branch:
```
POST http://localhost:3001/api/branches
Content-Type: application/json

{
  "name": "Chi nhánh Quận 1",
  "cityId": "CITY_ID_HERE",
  "address": "123 Nguyễn Huệ",
  "phone": "028 1234 5678"
}
```

#### Update Branch:
```
PUT http://localhost:3001/api/branches/BRANCH_ID_HERE
Content-Type: application/json

{
  "name": "Chi nhánh Quận 1 Updated",
  "phone": "028 8888 8888"
}
```

#### Delete Branch:
```
DELETE http://localhost:3001/api/branches/BRANCH_ID_HERE
```

---

## Expected Results

### Success Indicators:
- ✅ No console errors
- ✅ Toast notifications appear
- ✅ Data updates in real-time
- ✅ MongoDB has actual data
- ✅ Soft delete works (isActive flag)
- ✅ Filters work correctly
- ✅ Loading states show during operations

### Common Issues:

**Issue 1: "Không thể tải danh sách"**
- Check MongoDB is running
- Check database connection in `lib/mongodb.ts`

**Issue 2: "Lỗi kết nối"**
- Check dev server is running
- Check console for API errors
- Check network tab in DevTools

**Issue 3: Empty lists**
- Database might be empty
- Add some test data using the forms
- Or seed database with initial data

---

## Next Steps After Testing

1. ✅ Verify all tests pass
2. ✅ Check MongoDB has correct data
3. ✅ Confirm no mock data is being used
4. 📝 Review `MIGRATION_COMPLETE_REPORT.md`
5. 🎯 Optional: Implement payment flow refactor
6. 🔐 Optional: Add authentication (see `ADMIN_AUTHENTICATION_GUIDE.md`)

---

**Test Date:** ${new Date().toLocaleDateString('vi-VN')}
**Test Status:** Ready for testing ✅
