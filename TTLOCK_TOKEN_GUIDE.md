# TTLock API Token Guide

## 🔴 QUAN TRỌNG: Cách lấy Access Token đúng

TTLock có 2 loại token:

###1. **Developer Token** (OAuth2 client_credentials)
   - Dùng cho: Server-to-server
   - Không work với endpoint `/oauth2/token`
   
### 2. **User Token** (OAuth2 password grant)
   - **CẦN**: Username + Password của tài khoản TTLock app
   - Đây là tài khoản bạn dùng để đăng nhập app TTLock trên điện thoại
   
---

## ✅ CÁCH LẤY TOKEN ĐÚNG

### Bước 1: Lấy User Token (Required)
```http
POST https://api.ttlock.com/oauth2/token
Content-Type: application/x-www-form-urlencoded

client_id=7d00ffcd55a146a3a981626227b375fb
&client_secret=215d2828bbd9ff32a4656e979bf15d24
&username=YOUR_TTLOCK_APP_USERNAME    ← Email/SĐT đăng nhập app
&password=YOUR_TTLOCK_APP_PASSWORD    ← Mật khẩu app
&grant_type=password                   ← QUAN TRỌNG!
```

---

## 🤔 BẠN CẦN CUNG CẤP:

**Tài khoản TTLock App** (app bạn đang dùng để mở khóa):
- Username: _________________ (Email hoặc SĐT)
- Password: _________________ (Mật khẩu đăng nhập app)

**HOẶC:**

Nếu không muốn dùng tài khoản thật, tôi sẽ tạo **MOCK MODE** để test trước!

---

## 🎭 PHƯƠNG ÁN

### Option A: Dùng credentials thật ⭐
- Cho tôi username + password app TTLock
- Tôi sẽ lấy token thật
- Test mở khóa thật

### Option B: Dùng Mock Mode 🎭
- Không cần password
- Tạo fake API response
- Test UI và flow
- Chờ có token thật sau

Bạn chọn option nào?
