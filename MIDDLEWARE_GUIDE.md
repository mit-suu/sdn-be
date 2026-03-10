# 🔒 Middleware Documentation

## Overview
Các middleware được sử dụng để xác thực (authentication), phân quyền (authorization), và xử lý lỗi.

---

## 📁 Middleware Files

### 1. `authMiddleware.js`
Xác thực người dùng bằng JWT token.

#### `verifyToken`
- **Mục đích:** Kiểm tra và xác thực access token từ Authorization header
- **Cách sử dụng:**
  ```javascript
  const { verifyToken } = require("../middlewares/authMiddleware");
  
  router.get("/protected-route", verifyToken, controllerFunction);
  ```
- **Header yêu cầu:**
  ```
  Authorization: Bearer {accessToken}
  ```
- **Lỗi trả về:**
  - 401: Missing token hoặc token expired
  - 403: Invalid token

#### `optionalToken`
- **Mục đích:** Kiểm tra token nếu có, nhưng không bắt buộc
- **Cách sử dụng:**
  ```javascript
  const { optionalToken } = require("../middlewares/authMiddleware");
  
  router.get("/public-route", optionalToken, controllerFunction);
  ```

---

### 2. `errorHandler.js`
Xử lý tất cả các lỗi từ các routes.

#### `errorHandler`
- **Mục đích:** Middleware cuối cùng để catch và handle tất cả errors
- **Cách sử dụng:**
  ```javascript
  const { errorHandler } = require("../middlewares");
  
  // Phải đặt cuối cùng trong app.js, AFTER tất cả routes
  app.use((err, req, res, next) => {
    errorHandler(err, req, res, next);
  });
  ```
- **Xử lý các lỗi:**
  - Validation errors (Mongoose)
  - Invalid ObjectId
  - Duplicate key (409)
  - JWT errors
  - Server errors (500)

---

### 3. `permissionMiddleware.js`
Kiểm tra quyền hạn và phân quyền.

#### `checkBookingOwnership`
- **Mục đích:** Kiểm tra xem user có quyền sửa/xóa booking của họ
- **Cách sử dụng:**
  ```javascript
  const { checkBookingOwnership } = require("../middlewares");
  
  router.put("/:bookingId", verifyToken, checkBookingOwnership, updateBooking);
  router.delete("/:bookingId", verifyToken, checkBookingOwnership, deleteBooking);
  ```
- **Response nếu không có quyền:**
  ```json
  {
    "success": false,
    "message": "Booking not found"
  }
  ```

#### `rateLimit`
- **Mục đích:** Giới hạn số lượng request từ một IP trong khoảng thời gian
- **Cách sử dụng:**
  ```javascript
  const { rateLimit } = require("../middlewares");
  
  // 100 requests mỗi 15 phút (mặc định)
  app.use(rateLimit());
  
  // Tuỳ chỉnh: 10 requests mỗi 5 phút
  app.use(rateLimit(5 * 60 * 1000, 10));
  ```
- **Response khi vượt giới hạn:**
  ```json
  {
    "success": false,
    "message": "Too many requests. Please try again later."
  }
  ```

---

## 📋 Cách sử dụng trong app.js

```javascript
const express = require("express");
const cookieParser = require("cookie-parser");
const { errorHandler, rateLimit } = require("./middlewares");

const authRoute = require("./routes/authRoute");
const carRoutes = require("./routes/carRoutes");
const bookingRoutes = require("./routes/bookingRoutes");

const app = express();

// ─── Middleware cơ bản
app.use(express.json());
app.use(cookieParser());

// ─── Rate limiting
app.use(rateLimit(15 * 60 * 1000, 100)); // 100 requests per 15 minutes

// ─── Routes
app.use("/api/auth", authRoute);
app.use("/api/cars", carRoutes);
app.use("/api/bookings", bookingRoutes);

// ─── Error handler (PHẢI ĐẶT CUỐI CÙNG)
app.use((err, req, res, next) => {
  errorHandler(err, req, res, next);
});

module.exports = app;
```

---

## 📋 Cách sử dụng trong Routes

### Routes không cần auth
```javascript
const express = require("express");
const router = express.Router();
const { register, login } = require("../controllers/authController");

router.post("/register", register);
router.post("/login", login);

module.exports = router;
```

### Routes cần auth
```javascript
const express = require("express");
const router = express.Router();
const { verifyToken } = require("../middlewares/authMiddleware");
const { 
  getAllBookings, 
  getBookingById, 
  createBooking,
  updateBooking,
  deleteBooking 
} = require("../controllers/bookingController");

// Public routes
router.get("/", getAllBookings);
router.get("/:bookingId", getBookingById);

// Protected routes
router.post("/", verifyToken, createBooking);
router.put("/:bookingId", verifyToken, updateBooking);
router.delete("/:bookingId", verifyToken, deleteBooking);

module.exports = router;
```

---

## 🔐 Protected vs Public Routes

### Protected Endpoints (cần accessToken)
- `POST /auth/logout`
- `POST /auth/refresh`
- `POST /bookings` - Tạo booking
- `PUT /bookings/:bookingId` - Cập nhật booking
- `PUT /bookings/:bookingId/pickup` - Nhận xe
- `DELETE /bookings/:bookingId` - Hủy booking

### Public Endpoints (không cần auth)
- `GET /cars` - Xem tất cả xe
- `GET /cars/:carNumber` - Xem chi tiết xe
- `GET /bookings` - Xem tất cả bookings
- `GET /bookings/:bookingId` - Xem chi tiết booking
- `POST /auth/register` - Đăng ký
- `POST /auth/login` - Đăng nhập

### Optional Auth
- `GET /cars?status=available` - Kinh doanh có thể xem, customer cũng có thể xem

---

## 🧪 Testing Protected Routes

### Với curl
```bash
# 1. Đăng nhập
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"password123"}'

# Response sẽ có accessToken
# 2. Sử dụng token để call protected route
curl -X POST http://localhost:3000/api/bookings \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -d '{...booking data...}'
```

### Với Postman
1. Đăng nhập để lấy `accessToken`
2. Trong tab `Authorization`:
   - Type: `Bearer Token`
   - Token: Paste `accessToken`
3. Gửi request

---

## 🛡️ Security Best Practices

1. **Luôn bảo vệ sensitive endpoints** với `verifyToken`
2. **Sử dụng httpOnly cookies** cho `refreshToken` (đã được cấu hình)
3. **Access token ngắn hạn** (15 phút) - reduces risk nếu bị leak
4. **Refresh token dài hạn** (7 ngày) - stored securely as httpOnly cookie
5. **Rate limiting** - ngăn brute force attacks
6. **Validate input** ở controller level
7. **Hash passwords** với bcrypt (đã được cấu hình)

---

## ⚠️ Lỗi phổ biến

| Lỗi | Nguyên nhân | Giải pháp |
|-----|-----------|----------|
| 401 Unauthorized | Missing/expired token | Login lại để lấy new token |
| 403 Forbidden | Invalid token | Check token format: `Bearer {token}` |
| 429 Too Many Requests | Vượt rate limit | Chờ trước khi retry |
| 500 Internal Server Error | Server error | Check logs, restart server |

---

**Last Updated:** March 10, 2026
