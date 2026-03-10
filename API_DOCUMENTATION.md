# 🚗 Car Rental API Documentation

## Base URL
```
http://localhost:5000/api
```

---

## 📋 Table of Contents
1. [Authentication Endpoints](#authentication-endpoints)
2. [Car Endpoints](#car-endpoints)
3. [Booking Endpoints](#booking-endpoints)
4. [Error Handling](#error-handling)
5. [Response Format](#response-format)
6. [Data Models](#data-models)

---

## � Authentication Endpoints

### 1. Register
**Endpoint:** `POST /auth/register`

**Description:** Create a new user account and receive authentication tokens

**Request Headers:**
- `Content-Type: application/json`

**Request Body:**
```json
{
  "username": "nguyenvana",
  "email": "nguyenvana@example.com",
  "password": "Password123"
}
```

**Validation Rules:**
- `username` - Required, minimum 3 characters, must be unique
- `email` - Required, valid email format, must be unique
- `password` - Required, minimum 6 characters

**Response (201 Created):**
```json
{
  "message": "User registered successfully",
  "user": {
    "_id": "507f1f77bcf86cd799439013",
    "username": "nguyenvana",
    "email": "nguyenvana@example.com",
    "createdAt": "2025-03-10T10:00:00Z",
    "updatedAt": "2025-03-10T10:00:00Z"
  },
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Note:** 
- `refreshToken` is sent as `httpOnly` cookie automatically
- `accessToken` expires in 15 minutes
- `refreshToken` expires in 7 days

**Response (400 Bad Request):**
```json
{
  "message": "All fields are required"
}
```

**Response (409 Conflict):**
```json
{
  "message": "Email already exists"
}
```

---

### 2. Login
**Endpoint:** `POST /auth/login`

**Description:** Authenticate user and receive access token

**Request Headers:**
- `Content-Type: application/json`

**Request Body:**
```json
{
  "email": "nguyenvana@example.com",
  "password": "Password123"
}
```

**Response (200 OK):**
```json
{
  "message": "Login successful",
  "user": {
    "_id": "507f1f77bcf86cd799439013",
    "username": "nguyenvana",
    "email": "nguyenvana@example.com",
    "createdAt": "2025-03-10T10:00:00Z",
    "updatedAt": "2025-03-10T10:00:00Z"
  },
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Note:**
- `refreshToken` is sent as `httpOnly` cookie automatically
- Use the `accessToken` to authenticate subsequent requests
- Include in Authorization header: `Authorization: Bearer {accessToken}`

**Response (401 Unauthorized):**
```json
{
  "message": "Invalid credentials"
}
```

---

### 3. Logout
**Endpoint:** `POST /auth/logout`

**Description:** Logout user and invalidate refresh token

**Request Headers:**
- `Cookie: refreshToken={token}`

**Example Request:**
```
POST /api/auth/logout
```

**Response (200 OK):**
```json
{
  "message": "Logged out successfully"
}
```

**Note:**
- `refreshToken` cookie is cleared automatically
- `refreshToken` is removed from database

**Response (204 No Content):**
```
User was already logged out
```

---

### 4. Refresh Token
**Endpoint:** `POST /auth/refresh`

**Description:** Get a new access token using refresh token

**Request Headers:**
- `Cookie: refreshToken={token}`

**Example Request:**
```
POST /api/auth/refresh
```

**Response (200 OK):**
```json
{
  "message": "New access token generated",
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "_id": "507f1f77bcf86cd799439013",
    "username": "nguyenvana",
    "email": "nguyenvana@example.com"
  }
}
```

**Note:**
- Use this endpoint when `accessToken` expires
- `refreshToken` must be valid and present in cookies
- New access token is valid for 15 minutes

**Response (401 Unauthorized):**
```json
{
  "message": "Invalid or missing refresh token"
}
```

---

## �🚙 Car Endpoints

### 1. Get All Cars
**Endpoint:** `GET /cars`

**Description:** Retrieve all cars with optional filtering by status

**Query Parameters:**
- `status` (optional): Filter cars by status (`available`, `booked`, `maintenance`)

**Example Request:**
```
GET /api/cars
GET /api/cars?status=available
```

**Response (200 OK):**
```json
{
  "success": true,
  "count": 5,
  "data": [
    {
      "_id": "507f1f77bcf86cd799439011",
      "carNumber": "CAR001",
      "capacity": 5,
      "status": "available",
      "pricePerDay": 500000,
      "features": ["Air Conditioning", "Bluetooth"],
      "image": "url_to_image",
      "createdAt": "2025-03-01T10:00:00Z",
      "updatedAt": "2025-03-01T10:00:00Z"
    }
  ]
}
```

---

### 2. Get Single Car
**Endpoint:** `GET /cars/:carNumber`

**Description:** Retrieve a specific car by car number

**URL Parameters:**
- `carNumber` (required): The car number (e.g., `CAR001`)

**Example Request:**
```
GET /api/cars/CAR001
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "_id": "507f1f77bcf86cd799439011",
    "carNumber": "CAR001",
    "capacity": 5,
    "status": "available",
    "pricePerDay": 500000,
    "features": ["Air Conditioning", "Bluetooth"],
    "image": "url_to_image",
    "createdAt": "2025-03-01T10:00:00Z",
    "updatedAt": "2025-03-01T10:00:00Z"
  }
}
```

**Response (404 Not Found):**
```json
{
  "success": false,
  "message": "Car not found"
}
```

---

### 3. Create Car
**Endpoint:** `POST /cars`

**Description:** Create a new car

**Request Headers:**
- `Content-Type: application/json`

**Request Body:**
```json
{
  "carNumber": "CAR001",
  "capacity": 5,
  "status": "available",
  "pricePerDay": 500000,
  "features": ["Air Conditioning", "Bluetooth"],
  "image": "url_to_image"
}
```

**Response (201 Created):**
```json
{
  "success": true,
  "message": "Car created successfully",
  "data": {
    "_id": "507f1f77bcf86cd799439011",
    "carNumber": "CAR001",
    "capacity": 5,
    "status": "available",
    "pricePerDay": 500000,
    "features": ["Air Conditioning", "Bluetooth"],
    "image": "url_to_image",
    "createdAt": "2025-03-01T10:00:00Z",
    "updatedAt": "2025-03-01T10:00:00Z"
  }
}
```

**Response (400 Bad Request):**
```json
{
  "success": false,
  "message": "Car with number \"CAR001\" already exists"
}
```

---

### 4. Update Car
**Endpoint:** `PUT /cars/:carNumber`

**Description:** Update car information

**URL Parameters:**
- `carNumber` (required): The car number to update

**Request Body:** (All fields optional)
```json
{
  "capacity": 6,
  "status": "maintenance",
  "pricePerDay": 600000,
  "features": ["Air Conditioning", "Bluetooth", "GPS"],
  "image": "new_image_url"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Car updated successfully",
  "data": {
    "_id": "507f1f77bcf86cd799439011",
    "carNumber": "CAR001",
    "capacity": 6,
    "status": "maintenance",
    "pricePerDay": 600000,
    "features": ["Air Conditioning", "Bluetooth", "GPS"],
    "image": "new_image_url",
    "createdAt": "2025-03-01T10:00:00Z",
    "updatedAt": "2025-03-01T10:30:00Z"
  }
}
```

---

### 5. Delete Car
**Endpoint:** `DELETE /cars/:carNumber`

**Description:** Delete a car

**URL Parameters:**
- `carNumber` (required): The car number to delete

**Example Request:**
```
DELETE /api/cars/CAR001
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Car deleted successfully"
}
```

**Response (404 Not Found):**
```json
{
  "success": false,
  "message": "Car not found"
}
```

---

## 📅 Booking Endpoints

### 1. Get All Bookings
**Endpoint:** `GET /bookings`

**Description:** Retrieve all bookings (sorted by newest first)

**Example Request:**
```
GET /api/bookings
```

**Response (200 OK):**
```json
{
  "success": true,
  "count": 3,
  "data": [
    {
      "_id": "507f1f77bcf86cd799439012",
      "customerName": "Nguyễn Văn A",
      "carNumber": "CAR001",
      "startDate": "2025-03-10T00:00:00Z",
      "endDate": "2025-03-12T00:00:00Z",
      "totalAmount": 1000000,
      "status": "pending",
      "createdAt": "2025-03-01T10:00:00Z",
      "updatedAt": "2025-03-01T10:00:00Z"
    }
  ]
}
```

---

### 2. Get Single Booking
**Endpoint:** `GET /bookings/:bookingId`

**Description:** Retrieve a specific booking by ID

**URL Parameters:**
- `bookingId` (required): The MongoDB booking ID

**Example Request:**
```
GET /api/bookings/507f1f77bcf86cd799439012
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "_id": "507f1f77bcf86cd799439012",
    "customerName": "Nguyễn Văn A",
    "carNumber": "CAR001",
    "startDate": "2025-03-10T00:00:00Z",
    "endDate": "2025-03-12T00:00:00Z",
    "totalAmount": 1000000,
    "status": "pending",
    "createdAt": "2025-03-01T10:00:00Z",
    "updatedAt": "2025-03-01T10:00:00Z"
  }
}
```

**Response (404 Not Found):**
```json
{
  "success": false,
  "message": "Booking not found"
}
```

---

### 3. Create Booking
**Endpoint:** `POST /bookings`

**Description:** Create a new booking

**Request Headers:**
- `Content-Type: application/json`

**Request Body:**
```json
{
  "customerName": "Nguyễn Văn A",
  "carNumber": "CAR001",
  "startDate": "2025-03-10",
  "endDate": "2025-03-12"
}
```

**Validation Rules:**
- `customerName` - Required
- `carNumber` - Required, must exist in the system
- `startDate` - Required, must be before `endDate`
- `endDate` - Required, must be after `startDate`
- Car status must be "available"
- No booking overlap allowed for the same car

**Response (201 Created):**
```json
{
  "success": true,
  "message": "Booking created successfully",
  "data": {
    "_id": "507f1f77bcf86cd799439012",
    "customerName": "Nguyễn Văn A",
    "carNumber": "CAR001",
    "startDate": "2025-03-10T00:00:00Z",
    "endDate": "2025-03-12T00:00:00Z",
    "totalAmount": 1000000,
    "status": "pending",
    "createdAt": "2025-03-01T10:00:00Z",
    "updatedAt": "2025-03-01T10:00:00Z"
  }
}
```

**Response (400 Bad Request):**
```json
{
  "success": false,
  "message": "customerName, carNumber, startDate, endDate are all required"
}
```

**Response (404 Not Found):**
```json
{
  "success": false,
  "message": "Car \"CAR001\" not found"
}
```

**Response (409 Conflict - Booking Overlap):**
```json
{
  "success": false,
  "message": "Car \"CAR001\" is already booked from 2025-03-05 to 2025-03-08",
  "conflictingBooking": {
    "_id": "507f1f77bcf86cd799439011",
    "customerName": "Nguyễn Văn B",
    "carNumber": "CAR001",
    "startDate": "2025-03-05T00:00:00Z",
    "endDate": "2025-03-08T00:00:00Z",
    "totalAmount": 1500000,
    "status": "pending"
  }
}
```

---

### 4. Update Booking
**Endpoint:** `PUT /bookings/:bookingId`

**Description:** Update booking information

**URL Parameters:**
- `bookingId` (required): The MongoDB booking ID

**Request Body:** (Updatable fields)
```json
{
  "customerName": "Nguyễn Văn A - Updated",
  "startDate": "2025-03-11",
  "endDate": "2025-03-13"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Booking updated successfully",
  "data": {
    "_id": "507f1f77bcf86cd799439012",
    "customerName": "Nguyễn Văn A - Updated",
    "carNumber": "CAR001",
    "startDate": "2025-03-11T00:00:00Z",
    "endDate": "2025-03-13T00:00:00Z",
    "totalAmount": 1500000,
    "status": "pending",
    "createdAt": "2025-03-01T10:00:00Z",
    "updatedAt": "2025-03-01T10:30:00Z"
  }
}
```

---

### 5. Pickup Booking (Nhận Xe)
**Endpoint:** `PUT /bookings/:bookingId/pickup`

**Description:** Mark booking as picked up (change status to "confirmed")

**URL Parameters:**
- `bookingId` (required): The MongoDB booking ID

**Example Request:**
```
PUT /api/bookings/507f1f77bcf86cd799439012/pickup
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Booking confirmed - car picked up successfully",
  "data": {
    "_id": "507f1f77bcf86cd799439012",
    "customerName": "Nguyễn Văn A",
    "carNumber": "CAR001",
    "startDate": "2025-03-10T00:00:00Z",
    "endDate": "2025-03-12T00:00:00Z",
    "totalAmount": 1000000,
    "status": "confirmed",
    "createdAt": "2025-03-01T10:00:00Z",
    "updatedAt": "2025-03-01T10:30:00Z"
  }
}
```

---

### 6. Delete Booking
**Endpoint:** `DELETE /bookings/:bookingId`

**Description:** Cancel/delete a booking

**URL Parameters:**
- `bookingId` (required): The MongoDB booking ID

**Example Request:**
```
DELETE /api/bookings/507f1f77bcf86cd799439012
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Booking deleted successfully"
}
```

**Response (404 Not Found):**
```json
{
  "success": false,
  "message": "Booking not found"
}
```

---

## ⚠️ Error Handling

### Common Error Codes

| Status Code | Meaning |
|-------------|---------|
| 200 | OK - Request successful |
| 201 | Created - Resource created successfully |
| 400 | Bad Request - Invalid input or validation error |
| 404 | Not Found - Resource not found |
| 409 | Conflict - Booking overlap or duplicate resource |
| 500 | Internal Server Error - Server issue |

---

## 📝 Response Format

### Success Response
```json
{
  "success": true,
  "message": "Operation successful",
  "data": { ... }
}
```

### Error Response
```json
{
  "success": false,
  "message": "Error description"
}
```

---

## 🔍 Data Models

### Car Model
```javascript
{
  _id: ObjectId,
  carNumber: String (unique),
  capacity: Number,
  status: String (available, booked, maintenance),
  pricePerDay: Number,
  features: [String],
  image: String (optional),
  createdAt: Date,
  updatedAt: Date
}
```

### Booking Model
```javascript
{
  _id: ObjectId,
  customerName: String,
  carNumber: String,
  startDate: Date,
  endDate: Date,
  totalAmount: Number (calculated based on days × pricePerDay),
  status: String (pending, confirmed, completed, cancelled),
  createdAt: Date,
  updatedAt: Date
}
```

### User Model
```javascript
{
  _id: ObjectId,
  username: String (unique, min 3 chars),
  email: String (unique, valid format),
  password: String (min 6 chars, hashed with bcrypt),
  refreshToken: String (null by default),
  createdAt: Date,
  updatedAt: Date
}
```

---

## � Protected Endpoints

### Car Endpoints
- ❌ `GET /cars` - **PUBLIC**
- ❌ `GET /cars/:carNumber` - **PUBLIC**
- ✅ `POST /cars` - **PROTECTED** (Requires: `Authorization: Bearer {accessToken}`)
- ✅ `PUT /cars/:carNumber` - **PROTECTED**
- ✅ `DELETE /cars/:carNumber` - **PROTECTED**

### Booking Endpoints
- ❌ `GET /bookings` - **PUBLIC**
- ❌ `GET /bookings/:bookingId` - **PUBLIC**
- ✅ `POST /bookings` - **PROTECTED**
- ✅ `PUT /bookings/:bookingId` - **PROTECTED**
- ✅ `PUT /bookings/:bookingId/pickup` - **PROTECTED**
- ✅ `DELETE /bookings/:bookingId` - **PROTECTED**

---

## 📌 Notes

- All dates should be in ISO 8601 format (`YYYY-MM-DD` or `YYYY-MM-DDTHH:mm:ssZ`)
- `totalAmount` is automatically calculated during booking creation based on rental days and car price
- A car can only be booked if its status is "available"
- Bookings cannot overlap for the same car
- When a booking is picked up, the booking status changes to "confirmed"
- **Authentication:** Include `Authorization: Bearer {accessToken}` in request headers for protected endpoints
- **Tokens:** `accessToken` lasts 15 minutes, `refreshToken` lasts 7 days (refresh to get new accessToken)
- **Security:** Passwords are hashed with bcrypt, `refreshToken` stored as `httpOnly` cookies
- **Middleware:** See [MIDDLEWARE_GUIDE.md](MIDDLEWARE_GUIDE.md) for detailed middleware documentation
- **Rate Limiting:** API enforces rate limiting (100 requests per 15 minutes per IP)

---

**Last Updated:** March 10, 2026
