# 🚗 Tài Liệu Test Postman — API Nhận Xe (Pickup)

> **Base URL:** `http://localhost:3000`  
> **Content-Type:** `application/json`

---

## 📋 Tổng quan thay đổi

### Schema Booking — Thêm 2 trường mới

| Field        | Type     | Default     | Mô tả                                             |
|-------------|----------|-------------|-----------------------------------------------------|
| `status`    | String   | `"pending"` | Trạng thái booking: `pending` hoặc `picked_up`      |
| `pickupDate`| Date     | `null`      | Thời gian thực tế nhận xe (tự động set khi pickup)   |

### API Mới

| Method | Endpoint                              | Mô tả                    |
|--------|---------------------------------------|---------------------------|
| `PUT`  | `/bookings/:bookingId/pickup`         | Nhận xe (Pickup car)      |

---

## 🔹 `PUT /bookings/:bookingId/pickup` — Nhận xe

### Mô tả logic

1. Tìm booking theo `bookingId`
2. Kiểm tra booking chưa được nhận xe (`status !== "picked_up"`)
3. Kiểm tra thời gian hiện tại **≥ startDate** (chỉ cho nhận xe từ ngày bắt đầu trở đi)
4. Cập nhật:
   - `status` → `"picked_up"`
   - `pickupDate` → thời gian hiện tại (server time)

---

### ✅ Test Case 1 — Nhận xe thành công

| Thuộc tính     | Giá trị                                                |
| -------------- | ------------------------------------------------------- |
| **Method**     | `PUT`                                                   |
| **URL**        | `http://localhost:3000/bookings/{bookingId}/pickup`     |
| **Headers**    | Không yêu cầu                                          |
| **Body**       | Không có                                                |

> ⚠️ Thay `{bookingId}` bằng `_id` thật từ `GET /bookings`. Chọn 1 booking mà `startDate` **đã qua** hoặc **là hôm nay**.
>
> Ví dụ: Booking của "Nguyễn Văn An" với xe `51C-11111` có `startDate` là 2 ngày trước → phù hợp để test.

**Expected Response (200 OK):**

```json
{
  "success": true,
  "message": "Car picked up successfully",
  "data": {
    "_id": "...",
    "customerName": "Nguyễn Văn An",
    "carNumber": "51C-11111",
    "startDate": "2026-03-01T...",
    "endDate": "2026-03-04T...",
    "totalAmount": 1350000,
    "status": "picked_up",
    "pickupDate": "2026-03-03T07:16:05.000Z",
    "createdAt": "...",
    "updatedAt": "..."
  }
}
```

> 💡 `status` chuyển từ `"pending"` → `"picked_up"`  
> 💡 `pickupDate` được gán bằng thời gian hiện tại của server

---

### ❌ Test Case 2 — Booking không tồn tại (404)

| Thuộc tính     | Giá trị                                                              |
| -------------- | --------------------------------------------------------------------- |
| **Method**     | `PUT`                                                                |
| **URL**        | `http://localhost:3000/bookings/65f000000000000000000000/pickup`      |

**Expected Response (404):**

```json
{
  "success": false,
  "message": "Booking not found"
}
```

---

### ❌ Test Case 3 — Đã nhận xe rồi (400)

> Gọi lại API pickup cho booking **đã pickup ở Test Case 1**.

| Thuộc tính     | Giá trị                                                |
| -------------- | ------------------------------------------------------- |
| **Method**     | `PUT`                                                   |
| **URL**        | `http://localhost:3000/bookings/{bookingId}/pickup`     |

**Expected Response (400):**

```json
{
  "success": false,
  "message": "This booking has already been picked up",
  "pickupDate": "2026-03-03T07:16:05.000Z"
}
```

---

### ❌ Test Case 4 — Chưa đến ngày nhận xe (400)

> Chọn booking mà `startDate` **nằm trong tương lai** (chưa tới).
>
> Ví dụ: Booking của "Trần Thị Bình" với xe `51A-12345` có `startDate` là 3 ngày sau → chưa thể nhận xe.

| Thuộc tính     | Giá trị                                                |
| -------------- | ------------------------------------------------------- |
| **Method**     | `PUT`                                                   |
| **URL**        | `http://localhost:3000/bookings/{bookingId}/pickup`     |

**Expected Response (400):**

```json
{
  "success": false,
  "message": "Cannot pickup before start date. Start date is 2026-03-06, current time is 2026-03-03T07:16:05.000Z"
}
```

---

### ❌ Test Case 5 — ID sai format (500)

| Thuộc tính     | Giá trị                                                  |
| -------------- | --------------------------------------------------------- |
| **Method**     | `PUT`                                                    |
| **URL**        | `http://localhost:3000/bookings/invalid-id/pickup`       |

**Expected Response (500):**

```json
{
  "success": false,
  "message": "Cast to ObjectId failed for value \"invalid-id\" ..."
}
```

---

## 📌 Thứ Tự Test Khuyến Nghị

| Bước | Hành động                                         | Mục đích                                    |
|------|---------------------------------------------------|---------------------------------------------|
| 1    | `npm run seed`                                    | Khởi tạo dữ liệu mẫu                      |
| 2    | `GET /bookings`                                   | Xem tất cả booking, lấy `_id`              |
| 3    | Kiểm tra mỗi booking giờ có thêm `status: "pending"` và `pickupDate: null` | Verify schema mới |
| 4    | `PUT /bookings/{id_future}/pickup`                | ❌ Test pickup trước startDate → 400        |
| 5    | `PUT /bookings/{id_past}/pickup`                  | ✅ Test pickup thành công → 200             |
| 6    | `PUT /bookings/{id_past}/pickup` (lần 2)          | ❌ Test đã pickup rồi → 400                |
| 7    | `PUT /bookings/65f000000000000000000000/pickup`   | ❌ Test booking không tồn tại → 404         |
| 8    | `PUT /bookings/invalid-id/pickup`                 | ❌ Test ID sai format → 500                 |
| 9    | `GET /bookings/{id_past}`                         | Verify: `status = "picked_up"`, `pickupDate` có giá trị |

---

## 📌 Lưu ý quan trọng

- **Không cần gửi body** cho API pickup, tất cả dữ liệu tự động được xử lý bởi server.
- `pickupDate` là thời gian server tại thời điểm gọi API, **không phải** thời gian client gửi lên.
- Booking phải ở trạng thái `"pending"` mới có thể pickup.
- Thời gian hiện tại phải **≥ startDate** mới cho phép nhận xe.

---

> 📅 Tài liệu được tạo ngày: **03/03/2026**
