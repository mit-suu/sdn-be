# Production Deployment Guide

## Fix "Exited with status 1" Error

Render server không có MongoDB localhost. Bạn cần dùng **MongoDB Atlas** (cloud database miễn phí).

---

## Step 1: Setup MongoDB Atlas

1. Truy cập: https://www.mongodb.com/cloud/atlas
2. Đăng ký tài khoản (free)
3. Tạo Organization + Project
4. Tạo Cluster:
   - Chọn "Free" tier
   - Chọn region gần nhất (ap-southeast-1 cho Vietnam)
   - Create cluster (chờ ~5 phút)

5. Setup Database Access:
   - Security → Database Access
   - Create Database User (username & password)
   - Ghi nhớ username/password

6. Setup Network Access:
   - Security → Network Access
   - Add IP Address
   - Chọn "Allow from Anywhere" (0.0.0.0) cho development
   - Hoặc add IP riêng nếu biết

7. Lấy Connection String:
   - Cluster → Connect
   - Chọn "Drivers"
   - Copy "MongoDB for Node.js"
   - Format: `mongodb+srv://username:password@cluster.mongodb.net/carRental`

---

## Step 2: Set Environment Variables trên Render

1. Đi tới Render Dashboard
2. Chọn Service "sdn-be"
3. Vào "Environment"
4. Thêm/Edit variables:

```
PORT=3000
NODE_ENV=production
MONGODB_URI=mongodb+srv://YOUR_USERNAME:YOUR_PASSWORD@YOUR_CLUSTER.mongodb.net/carRental
CLIENT_URL=https://your-frontend-domain.com
ACCESS_TOKEN_SECRET=your_secure_random_key_here_minimum_32_characters
ACCESS_TOKEN_EXPIRES_IN=15m
REFRESH_TOKEN_SECRET=another_secure_random_key_minimum_32_characters
REFRESH_TOKEN_EXPIRES_IN=7d
```

5. Deploy lại

---

## Step 3: Generate Secure Secret Keys

Dùng terminal để generate random keys:

```bash
# Linux/Mac/WSL
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# Windows PowerShell
[System.Convert]::ToHexString([System.Security.Cryptography.RandomNumberGenerator]::GetBytes(32))
```

---

## Checklist

- [ ] MongoDB Atlas account tạo
- [ ] Database cluster tạo
- [ ] Database user tạo
- [ ] IP whitelist setup
- [ ] Connection string lấy
- [ ] Render environment variables set
- [ ] Secret keys generate và set
- [ ] Deploy lại từ Render dashboard
- [ ] Test: curl https://your-be-url.com (should return `{"message":"Car Rental API is running!"}`)

---

## Troubleshooting

### Still "Exited with status 1"?

1. Check Render logs:
   ```bash
   # Trong Render dashboard, xem "Logs" tab
   ```

2. Test MongoDB connection locally:
   ```bash
   # Update .env với MongoDB URI từ Atlas
   npm install -g mongodb
   mongosh "mongodb+srv://username:password@cluster.mongodb.net"
   ```

3. Kiểm tra file app.js có error syntax
   ```bash
   node app.js  # Chạy local để test
   ```

### Port issues?
- Render sẽ override PORT variable
- Đảm bảo `process.env.PORT || 3000` được dùng

### CORS issues?
- Frontend URL cần match `CLIENT_URL` trong BE
- Check trong app.js: `origin: process.env.CLIENT_URL`

---

## Notes

- Không commit `.env` file (đã có `.gitignore`)
- Environment variables chỉ set trên Render dashboard, không local
- Secret keys nên 32+ characters, không dùng placeholder giống nhau
