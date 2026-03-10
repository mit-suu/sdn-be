# 📮 Tài Liệu Test Postman — Car Rental API

> **Base URL:** `http://localhost:3000`
> **Content-Type:** `application/json`

---

## 📑 Mục Lục

1. [Health Check](#1-health-check)
2. [Car API](#2-car-api)
   - [2.1 Lấy danh sách tất cả xe](#21-get-cars--lấy-danh-sách-tất-cả-xe)
   - [2.2 Lọc xe theo trạng thái](#22-get-carsstatus--lọc-xe-theo-trạng-thái)
   - [2.3 Lấy thông tin một xe](#23-get-carscarnumber--lấy-thông-tin-một-xe)
   - [2.4 Tạo xe mới](#24-post-cars--tạo-xe-mới)
   - [2.5 Cập nhật xe](#25-put-carscarnumber--cập-nhật-xe)
   - [2.6 Xoá xe](#26-delete-carscarnumber--xoá-xe)
3. [Booking API](#3-booking-api)
   - [3.1 Lấy danh sách tất cả booking](#31-get-bookings--lấy-danh-sách-tất-cả-booking)
   - [3.2 Lấy thông tin một booking](#32-get-bookingsbookingid--lấy-thông-tin-một-booking)
   - [3.3 Tạo booking mới](#33-post-bookings--tạo-booking-mới)
   - [3.4 Cập nhật booking](#34-put-bookingsbookingid--cập-nhật-booking)
   - [3.5 Xoá booking](#35-delete-bookingsbookingid--xoá-booking)
4. [Test Cases — Error & Edge Cases](#4-test-cases--error--edge-cases)
5. [Thứ Tự Test Khuyến Nghị](#5-thứ-tự-test-khuyến-nghị)

---

## 1. Health Check

### `GET /`

Kiểm tra server đang hoạt động.

| Thuộc tính     | Giá trị                          |
| -------------- | -------------------------------- |
| **Method**     | `GET`                            |
| **URL**        | `http://localhost:3000/`         |
| **Headers**    | Không yêu cầu                   |
| **Body**       | Không có                         |

**✅ Expected Response (200 OK):**

```json
{
  "message": "Car Rental API is running!"
}
```

---

## 2. Car API

### 2.1 `GET /cars` — Lấy danh sách tất cả xe

| Thuộc tính     | Giá trị                          |
| -------------- | -------------------------------- |
| **Method**     | `GET`                            |
| **URL**        | `http://localhost:3000/cars`     |
| **Headers**    | Không yêu cầu                   |
| **Body**       | Không có                         |

**✅ Expected Response (200 OK):**

```json
{
  "success": true,
  "count": 7,
  "data": [
    {
      "_id": "...",
      "carNumber": "51A-12345",
      "capacity": 4,
      "status": "available",
      "pricePerDay": 500000,
      "features": ["automatic", "air-conditioner", "bluetooth"],
      "image": "https://images.unsplash.com/...",
      "createdAt": "2026-03-03T...",
      "updatedAt": "2026-03-03T..."
    }
  ]
}
```

---

### 2.2 `GET /cars?status=` — Lọc xe theo trạng thái

| Thuộc tính     | Giá trị                                         |
| -------------- | ------------------------------------------------ |
| **Method**     | `GET`                                            |
| **URL**        | `http://localhost:3000/cars?status=available`     |
| **Headers**    | Không yêu cầu                                   |
| **Body**       | Không có                                         |

**Các giá trị `status` hợp lệ:** `available`, `rented`, `maintenance`

**✅ Expected Response (200 OK):**

```json
{
  "success": true,
  "count": 4,
  "data": [
    {
      "_id": "...",
      "carNumber": "51A-12345",
      "capacity": 4,
      "status": "available",
      "pricePerDay": 500000,
      "features": ["automatic", "air-conditioner", "bluetooth"],
      "image": "...",
      "createdAt": "...",
      "updatedAt": "..."
    }
  ]
}
```

**📝 Test thêm:**

| Test Case                            | URL                                                 | Kết quả mong đợi                          |
| ------------------------------------ | --------------------------------------------------- | ------------------------------------------ |
| Lọc xe đang cho thuê                | `http://localhost:3000/cars?status=rented`           | Chỉ trả về xe có status = "rented"         |
| Lọc xe đang bảo trì                 | `http://localhost:3000/cars?status=maintenance`      | Chỉ trả về xe có status = "maintenance"    |
| Status không hợp lệ                 | `http://localhost:3000/cars?status=xyz`              | Trả về mảng rỗng `count: 0`               |

---

### 2.3 `GET /cars/:carNumber` — Lấy thông tin một xe

| Thuộc tính     | Giá trị                                   |
| -------------- | ------------------------------------------ |
| **Method**     | `GET`                                      |
| **URL**        | `http://localhost:3000/cars/51A-12345`     |
| **Headers**    | Không yêu cầu                             |
| **Body**       | Không có                                   |

**✅ Expected Response (200 OK):**

```json
{
  "success": true,
  "data": {
    "_id": "...",
    "carNumber": "51A-12345",
    "capacity": 4,
    "status": "available",
    "pricePerDay": 500000,
    "features": ["automatic", "air-conditioner", "bluetooth"],
    "image": "https://images.unsplash.com/...",
    "createdAt": "...",
    "updatedAt": "..."
  }
}
```

**❌ Error Case — Xe không tồn tại (404):**

| Thuộc tính     | Giá trị                                     |
| -------------- | -------------------------------------------- |
| **URL**        | `http://localhost:3000/cars/KHONG-TON-TAI`   |

```json
{
  "success": false,
  "message": "Car not found"
}
```

---

### 2.4 `POST /cars` — Tạo xe mới

| Thuộc tính     | Giá trị                            |
| -------------- | ----------------------------------- |
| **Method**     | `POST`                             |
| **URL**        | `http://localhost:3000/cars`        |
| **Headers**    | `Content-Type: application/json`   |

**Request Body:**

```json
{
  "carNumber": "51H-99999",
  "capacity": 5,
  "status": "available",
  "pricePerDay": 700000,
  "features": ["automatic", "air-conditioner", "GPS", "dashcam"],
  "image": "https://example.com/car.jpg"
}
```

**✅ Expected Response (201 Created):**

```json
{
  "success": true,
  "message": "Car created successfully",
  "data": {
    "_id": "...",
    "carNumber": "51H-99999",
    "capacity": 5,
    "status": "available",
    "pricePerDay": 700000,
    "features": ["automatic", "air-conditioner", "GPS", "dashcam"],
    "image": "https://example.com/car.jpg",
    "createdAt": "...",
    "updatedAt": "..."
  }
}
```

**❌ Error Cases:**

#### a) Thiếu trường bắt buộc (400)

```json
{
  "carNumber": "51H-88888"
}
```

```json
{
  "success": false,
  "message": "Car validation failed: pricePerDay: Price per day is required, capacity: Capacity is required"
}
```

#### b) Trùng carNumber (400)

```json
{
  "carNumber": "51A-12345",
  "capacity": 4,
  "pricePerDay": 500000
}
```

```json
{
  "success": false,
  "message": "Car with number \"51A-12345\" already exists"
}
```

#### c) Status không hợp lệ (400)

```json
{
  "carNumber": "51H-77777",
  "capacity": 4,
  "pricePerDay": 500000,
  "status": "broken"
}
```

```json
{
  "success": false,
  "message": "Car validation failed: status: Status must be: available, rented, or maintenance"
}
```

#### d) Capacity < 1 (400)

```json
{
  "carNumber": "51H-66666",
  "capacity": 0,
  "pricePerDay": 500000
}
```

```json
{
  "success": false,
  "message": "Car validation failed: capacity: Capacity must be at least 1"
}
```

---

### 2.5 `PUT /cars/:carNumber` — Cập nhật xe

| Thuộc tính     | Giá trị                                   |
| -------------- | ------------------------------------------ |
| **Method**     | `PUT`                                      |
| **URL**        | `http://localhost:3000/cars/51H-99999`     |
| **Headers**    | `Content-Type: application/json`           |

**Request Body (chỉ cần gửi field muốn cập nhật):**

```json
{
  "pricePerDay": 850000,
  "status": "maintenance",
  "features": ["automatic", "air-conditioner", "GPS", "dashcam", "sunroof"]
}
```

**✅ Expected Response (200 OK):**

```json
{
  "success": true,
  "message": "Car updated successfully",
  "data": {
    "_id": "...",
    "carNumber": "51H-99999",
    "capacity": 5,
    "status": "maintenance",
    "pricePerDay": 850000,
    "features": ["automatic", "air-conditioner", "GPS", "dashcam", "sunroof"],
    "image": "https://example.com/car.jpg",
    "createdAt": "...",
    "updatedAt": "..."
  }
}
```

**❌ Error Case — Xe không tồn tại (404):**

| Thuộc tính     | Giá trị                                     |
| -------------- | -------------------------------------------- |
| **URL**        | `http://localhost:3000/cars/KHONG-TON-TAI`   |

```json
{
  "success": false,
  "message": "Car not found"
}
```

---

### 2.6 `DELETE /cars/:carNumber` — Xoá xe

| Thuộc tính     | Giá trị                                   |
| -------------- | ------------------------------------------ |
| **Method**     | `DELETE`                                   |
| **URL**        | `http://localhost:3000/cars/51H-99999`     |
| **Headers**    | Không yêu cầu                             |
| **Body**       | Không có                                   |

**✅ Expected Response (200 OK):**

```json
{
  "success": true,
  "message": "Car deleted successfully"
}
```

**❌ Error Case — Xe không tồn tại (404):**

```json
{
  "success": false,
  "message": "Car not found"
}
```

---

## 3. Booking API

### 3.1 `GET /bookings` — Lấy danh sách tất cả booking

| Thuộc tính     | Giá trị                              |
| -------------- | ------------------------------------- |
| **Method**     | `GET`                                |
| **URL**        | `http://localhost:3000/bookings`     |
| **Headers**    | Không yêu cầu                       |
| **Body**       | Không có                             |

**✅ Expected Response (200 OK):**

```json
{
  "success": true,
  "count": 5,
  "data": [
    {
      "_id": "...",
      "customerName": "Nguyễn Văn An",
      "carNumber": "51C-11111",
      "startDate": "2026-03-01T...",
      "endDate": "2026-03-04T...",
      "totalAmount": 1350000,
      "createdAt": "...",
      "updatedAt": "..."
    }
  ]
}
```

---

### 3.2 `GET /bookings/:bookingId` — Lấy thông tin một booking

| Thuộc tính     | Giá trị                                                    |
| -------------- | ----------------------------------------------------------- |
| **Method**     | `GET`                                                      |
| **URL**        | `http://localhost:3000/bookings/{bookingId}`                |
| **Headers**    | Không yêu cầu                                             |
| **Body**       | Không có                                                   |

> ⚠️ Thay `{bookingId}` bằng `_id` thật lấy từ response của `GET /bookings`

**✅ Expected Response (200 OK):**

```json
{
  "success": true,
  "data": {
    "_id": "65f...",
    "customerName": "Nguyễn Văn An",
    "carNumber": "51C-11111",
    "startDate": "2026-03-01T...",
    "endDate": "2026-03-04T...",
    "totalAmount": 1350000,
    "createdAt": "...",
    "updatedAt": "..."
  }
}
```

**❌ Error Cases:**

#### a) Booking không tồn tại (404)

```
GET http://localhost:3000/bookings/65f000000000000000000000
```

```json
{
  "success": false,
  "message": "Booking not found"
}
```

#### b) ID không đúng định dạng ObjectId (500)

```
GET http://localhost:3000/bookings/invalid-id
```

```json
{
  "success": false,
  "message": "Cast to ObjectId failed for value \"invalid-id\" ..."
}
```

---

### 3.3 `POST /bookings` — Tạo booking mới

| Thuộc tính     | Giá trị                              |
| -------------- | ------------------------------------- |
| **Method**     | `POST`                               |
| **URL**        | `http://localhost:3000/bookings`     |
| **Headers**    | `Content-Type: application/json`     |

**Request Body:**

```json
{
  "customerName": "Võ Thanh Tùng",
  "carNumber": "51G-55555",
  "startDate": "2026-03-10",
  "endDate": "2026-03-15"
}
```

**✅ Expected Response (201 Created):**

```json
{
  "success": true,
  "message": "Booking created successfully",
  "data": {
    "_id": "...",
    "customerName": "Võ Thanh Tùng",
    "carNumber": "51G-55555",
    "startDate": "2026-03-10T00:00:00.000Z",
    "endDate": "2026-03-15T00:00:00.000Z",
    "totalAmount": 1750000,
    "createdAt": "...",
    "updatedAt": "..."
  }
}
```

> 💡 `totalAmount` được tính tự động: 5 ngày × 350,000₫/ngày = 1,750,000₫
> 💡 Xe `51G-55555` sẽ tự động chuyển status thành `"rented"`

**❌ Error Cases:**

#### a) Thiếu trường bắt buộc (400)

```json
{
  "customerName": "Nguyễn Văn A"
}
```

```json
{
  "success": false,
  "message": "customerName, carNumber, startDate, endDate are all required"
}
```

#### b) endDate <= startDate (400)

```json
{
  "customerName": "Nguyễn Văn B",
  "carNumber": "51A-12345",
  "startDate": "2026-03-15",
  "endDate": "2026-03-10"
}
```

```json
{
  "success": false,
  "message": "endDate must be after startDate"
}
```

#### c) Xe không tồn tại (404)

```json
{
  "customerName": "Nguyễn Văn C",
  "carNumber": "KHONG-TON-TAI",
  "startDate": "2026-03-10",
  "endDate": "2026-03-15"
}
```

```json
{
  "success": false,
  "message": "Car \"KHONG-TON-TAI\" not found"
}
```

#### d) Xe không ở trạng thái available (400)

```json
{
  "customerName": "Nguyễn Văn D",
  "carNumber": "51E-33333",
  "startDate": "2026-03-10",
  "endDate": "2026-03-15"
}
```

> Xe `51E-33333` có status = "maintenance"

```json
{
  "success": false,
  "message": "Car \"51E-33333\" is currently maintenance and cannot be booked"
}
```

#### e) Trùng lịch booking (409 Conflict)

```json
{
  "customerName": "Nguyễn Văn E",
  "carNumber": "51G-55555",
  "startDate": "2026-03-12",
  "endDate": "2026-03-18"
}
```

> Giả sử `51G-55555` đã được book từ 10/03 → 15/03

```json
{
  "success": false,
  "message": "Car \"51G-55555\" is already booked from 2026-03-10 to 2026-03-15",
  "conflictingBooking": {
    "_id": "...",
    "customerName": "Võ Thanh Tùng",
    "carNumber": "51G-55555",
    "startDate": "2026-03-10T00:00:00.000Z",
    "endDate": "2026-03-15T00:00:00.000Z",
    "totalAmount": 1750000
  }
}
```

---

### 3.4 `PUT /bookings/:bookingId` — Cập nhật booking

| Thuộc tính     | Giá trị                                           |
| -------------- | -------------------------------------------------- |
| **Method**     | `PUT`                                              |
| **URL**        | `http://localhost:3000/bookings/{bookingId}`       |
| **Headers**    | `Content-Type: application/json`                   |

> ⚠️ Thay `{bookingId}` bằng `_id` thật từ database

**Request Body (chỉ cần gửi field muốn cập nhật):**

```json
{
  "customerName": "Võ Thanh Tùng (Updated)",
  "endDate": "2026-03-20"
}
```

**✅ Expected Response (200 OK):**

```json
{
  "success": true,
  "message": "Booking updated successfully",
  "data": {
    "_id": "...",
    "customerName": "Võ Thanh Tùng (Updated)",
    "carNumber": "51G-55555",
    "startDate": "2026-03-10T00:00:00.000Z",
    "endDate": "2026-03-20T00:00:00.000Z",
    "totalAmount": 3500000,
    "createdAt": "...",
    "updatedAt": "..."
  }
}
```

> 💡 `totalAmount` tự động tính lại: 10 ngày × 350,000₫ = 3,500,000₫

**❌ Error Cases:**

#### a) Booking không tồn tại (404)

```json
{
  "success": false,
  "message": "Booking not found"
}
```

#### b) endDate <= startDate (400)

```json
{
  "endDate": "2026-03-05"
}
```

> Nếu startDate hiện tại là 10/03 → endDate 05/03 sẽ lỗi

```json
{
  "success": false,
  "message": "endDate must be after startDate"
}
```

#### c) Xe mới không tồn tại (404)

```json
{
  "carNumber": "KHONG-TON-TAI"
}
```

```json
{
  "success": false,
  "message": "Car \"KHONG-TON-TAI\" not found"
}
```

#### d) Trùng lịch với booking khác (409)

```json
{
  "success": false,
  "message": "Car \"51G-55555\" is already booked during this period",
  "conflictingBooking": { ... }
}
```

---

### 3.5 `DELETE /bookings/:bookingId` — Xoá booking

| Thuộc tính     | Giá trị                                           |
| -------------- | -------------------------------------------------- |
| **Method**     | `DELETE`                                           |
| **URL**        | `http://localhost:3000/bookings/{bookingId}`       |
| **Headers**    | Không yêu cầu                                     |
| **Body**       | Không có                                           |

> ⚠️ Thay `{bookingId}` bằng `_id` thật

**✅ Expected Response (200 OK):**

```json
{
  "success": true,
  "message": "Booking deleted successfully"
}
```

> 💡 Nếu xe không còn booking active nào (endDate > now), xe sẽ tự động chuyển status về `"available"`

**❌ Error Case — Booking không tồn tại (404):**

```json
{
  "success": false,
  "message": "Booking not found"
}
```

---

## 4. Test Cases — Error & Edge Cases

### 4.1 Route không tồn tại (404)

```
GET http://localhost:3000/khong-ton-tai
```

```json
{
  "success": false,
  "message": "Route not found"
}
```

---

### 4.2 Tổng hợp Error Cases

| # | API                               | Test Case                          | Method   | Status Code | Message                                                          |
|---|-----------------------------------|------------------------------------|----------|-------------|------------------------------------------------------------------|
| 1 | `GET /cars/:carNumber`            | Xe không tồn tại                   | GET      | 404         | `Car not found`                                                  |
| 2 | `POST /cars`                      | Thiếu `capacity`                   | POST     | 400         | `Car validation failed: capacity: Capacity is required`          |
| 3 | `POST /cars`                      | Thiếu `pricePerDay`                | POST     | 400         | `Car validation failed: pricePerDay: Price per day is required`  |
| 4 | `POST /cars`                      | Thiếu `carNumber`                  | POST     | 400         | `Car validation failed: carNumber: Car number is required`       |
| 5 | `POST /cars`                      | `carNumber` bị trùng              | POST     | 400         | `Car with number "..." already exists`                           |
| 6 | `POST /cars`                      | `status` không hợp lệ            | POST     | 400         | `Status must be: available, rented, or maintenance`              |
| 7 | `POST /cars`                      | `capacity` < 1                    | POST     | 400         | `Capacity must be at least 1`                                    |
| 8 | `POST /cars`                      | `pricePerDay` < 0                 | POST     | 400         | `Price must be a positive number`                                |
| 9 | `PUT /cars/:carNumber`            | Xe không tồn tại                   | PUT      | 404         | `Car not found`                                                  |
| 10| `DELETE /cars/:carNumber`         | Xe không tồn tại                   | DELETE   | 404         | `Car not found`                                                  |
| 11| `GET /bookings/:id`               | Booking không tồn tại             | GET      | 404         | `Booking not found`                                              |
| 12| `GET /bookings/:id`               | ID sai format                      | GET      | 500         | `Cast to ObjectId failed...`                                     |
| 13| `POST /bookings`                  | Thiếu trường bắt buộc             | POST     | 400         | `customerName, carNumber, startDate, endDate are all required`   |
| 14| `POST /bookings`                  | `endDate` ≤ `startDate`           | POST     | 400         | `endDate must be after startDate`                                |
| 15| `POST /bookings`                  | Xe không tồn tại                   | POST     | 404         | `Car "..." not found`                                            |
| 16| `POST /bookings`                  | Xe đang maintenance/rented         | POST     | 400         | `Car "..." is currently ... and cannot be booked`                |
| 17| `POST /bookings`                  | Trùng lịch                         | POST     | 409         | `Car "..." is already booked from ... to ...`                    |
| 18| `PUT /bookings/:id`               | Booking không tồn tại             | PUT      | 404         | `Booking not found`                                              |
| 19| `PUT /bookings/:id`               | `endDate` ≤ `startDate`           | PUT      | 400         | `endDate must be after startDate`                                |
| 20| `PUT /bookings/:id`               | Xe mới không tồn tại              | PUT      | 404         | `Car "..." not found`                                            |
| 21| `PUT /bookings/:id`               | Trùng lịch                         | PUT      | 409         | `Car "..." is already booked during this period`                 |
| 22| `DELETE /bookings/:id`            | Booking không tồn tại             | DELETE   | 404         | `Booking not found`                                              |
| 23| `GET /khong-ton-tai`              | Route không tồn tại               | GET      | 404         | `Route not found`                                                |

---

## 5. Thứ Tự Test Khuyến Nghị

Để đảm bảo test đầy đủ và đúng logic, nên follow thứ tự sau:

### 🔹 Bước 1 — Chuẩn bị dữ liệu

```bash
# Chạy seed để có dữ liệu mẫu
npm run seed
```

### 🔹 Bước 2 — Test Car API

| Bước | API                                  | Mục đích                                |
|------|--------------------------------------|-----------------------------------------|
| 2.1  | `GET /`                             | Health check                            |
| 2.2  | `GET /cars`                          | Xem tất cả xe (nên có 7 xe từ seed)    |
| 2.3  | `GET /cars?status=available`         | Lọc xe available                        |
| 2.4  | `GET /cars/51A-12345`                | Xem chi tiết 1 xe                       |
| 2.5  | `GET /cars/KHONG-TON-TAI`            | Test 404                                |
| 2.6  | `POST /cars` (đầy đủ body)          | Tạo xe mới thành công                   |
| 2.7  | `POST /cars` (trùng carNumber)      | Test trùng — 400                        |
| 2.8  | `POST /cars` (thiếu field)          | Test validation — 400                   |
| 2.9  | `PUT /cars/51H-99999`               | Cập nhật xe vừa tạo                     |
| 2.10 | `DELETE /cars/51H-99999`            | Xoá xe vừa tạo                          |
| 2.11 | `DELETE /cars/51H-99999`            | Xoá lần 2 — 404                         |

### 🔹 Bước 3 — Test Booking API

| Bước | API                                  | Mục đích                                |
|------|--------------------------------------|-----------------------------------------|
| 3.1  | `GET /bookings`                      | Xem tất cả booking (có 5 từ seed)      |
| 3.2  | `GET /bookings/{id}`                 | Xem chi tiết 1 booking                  |
| 3.3  | `GET /bookings/invalid-id`           | Test ID sai format — 500                |
| 3.4  | `POST /bookings` (đầy đủ body)      | Tạo booking mới thành công              |
| 3.5  | Verify: `GET /cars/51G-55555`        | Xác nhận xe đã chuyển sang "rented"     |
| 3.6  | `POST /bookings` (trùng lịch)       | Test overlap — 409                      |
| 3.7  | `POST /bookings` (thiếu field)      | Test required — 400                     |
| 3.8  | `POST /bookings` (endDate ≤ start)  | Test date logic — 400                   |
| 3.9  | `POST /bookings` (xe maintenance)   | Test xe không available — 400            |
| 3.10 | `PUT /bookings/{id}`                | Cập nhật booking → verify totalAmount   |
| 3.11 | `DELETE /bookings/{id}`             | Xoá booking                             |
| 3.12 | Verify: `GET /cars/51G-55555`       | Xác nhận xe quay lại "available"         |

### 🔹 Bước 4 — Test Edge Cases

| Bước | API                                  | Mục đích                                |
|------|--------------------------------------|-----------------------------------------|
| 4.1  | `GET /khong-ton-tai`                 | Route không tồn tại — 404               |
| 4.2  | `POST /cars` body rỗng              | Gửi empty body — validation errors      |
| 4.3  | `POST /bookings` body rỗng          | Gửi empty body — 400                    |

---

## 📌 Data Models Reference

### Car Model

| Field        | Type       | Required | Default       | Validation                                         |
|-------------|------------|----------|---------------|-----------------------------------------------------|
| `carNumber` | String     | ✅       | —             | Unique, trimmed                                      |
| `capacity`  | Number     | ✅       | —             | Min: 1                                               |
| `status`    | String     | ❌       | `"available"` | Enum: `available`, `rented`, `maintenance`           |
| `pricePerDay`| Number    | ✅       | —             | Min: 0                                               |
| `features`  | [String]   | ❌       | `[]`          | —                                                    |
| `image`     | String     | ❌       | `""`          | Trimmed                                              |

### Booking Model

| Field          | Type     | Required | Default | Validation                          |
|---------------|----------|----------|---------|--------------------------------------|
| `customerName` | String   | ✅       | —       | Trimmed                              |
| `carNumber`    | String   | ✅       | —       | Trimmed                              |
| `startDate`    | Date     | ✅       | —       | —                                    |
| `endDate`      | Date     | ✅       | —       | Must be after `startDate`            |
| `totalAmount`  | Number   | ❌       | `0`     | Tự động tính bởi server              |

---

> 📅 Tài liệu được tạo ngày: **03/03/2026**
> 🔧 Server port mặc định: **3000**
> 🗄️ Database: **MongoDB** tại `mongodb://localhost:27017/carRental`
