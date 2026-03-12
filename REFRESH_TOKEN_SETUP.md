# 🔐 Refresh Token Configuration Guide

## 📋 Tổng Quan
File này hướng dẫn cách cấu hình **refresh token** cho production trên **Render.com** với HTTPS.

---

## ✅ Checklist Cấu Hình

### Backend (Node.js Express)

#### 1. **Cookie SameSite & Secure** ✅
**File:** `src/controllers/authController.js`

```javascript
const setRefreshTokenCookie = (res, token) => {
  const isProduction = process.env.NODE_ENV === "production";
  
  res.cookie("refreshToken", token, {
    httpOnly: true,                     // ✅ Không thể truy cập từ JS
    secure: isProduction,               // ✅ Chỉ gửi qua HTTPS (bắt buộc khi sameSite: "none")
    sameSite: isProduction ? "none" : "lax", // ✅ Cross-origin support
    maxAge: 7 * 24 * 60 * 60 * 1000,   // 7 days
    path: "/",                          // ✅ Cookie có sẵn cho tất cả paths
  });
};
```

**⚠️ QUY TẮC QUAN TRỌNG:**
- Khi `sameSite: "none"`, **PHẢI** có `secure: true`
- Khi `sameSite: "lax"` hoặc `"strict"`, `secure` có thể false (dev)
- Trên production (Render), NODE_ENV phải = `"production"` để secure = true

#### 2. **CORS Configuration** ✅
**File:** `src/app.js`

```javascript
app.use(
  cors({
    origin: function (origin, callback) {
      // Only allow whitelisted origins
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,  // ✅ CRITICAL: Allow cookies & auth headers
    maxAge: 86400
  })
);
```

#### 3. **Environment Variables** ✅
**File:** `.env` (development) & Render environment variables (production)

```bash
# Development
NODE_ENV=development
CLIENT_URL=http://localhost:3001
ACCESS_TOKEN_SECRET=dev_secret_key_here
REFRESH_TOKEN_SECRET=dev_refresh_secret_here
```

```bash
# Production (Set in Render Dashboard)
NODE_ENV=production
CLIENT_URL=https://your-frontend-url.com
ACCESS_TOKEN_SECRET=generate_secure_random_string_here
REFRESH_TOKEN_SECRET=generate_another_secure_random_string_here
MONGODB_URI=mongodb+srv://...
```

#### 4. **Refresh Token Endpoint** ✅
**File:** `src/routes/authRoute.js` & `src/controllers/authController.js`

```javascript
// Endpoint POST /api/auth/refresh
const refresh = async (req, res) => {
  try {
    const token = req.cookies?.refreshToken;

    if (!token) {
      return res.status(401).json({ 
        message: "Refresh token not found in cookies" 
      });
    }

    // Verify & rotate token (return new access token)
    const decoded = jwt.verify(token, process.env.REFRESH_TOKEN_SECRET);
    const newAccessToken = generateAccessToken(decoded.id);
    
    return res.status(200).json({
      message: "Token refreshed",
      accessToken: newAccessToken,
    });
  } catch (error) {
    return res.status(403).json({ 
      message: "Invalid or expired refresh token" 
    });
  }
};
```

---

### Frontend (React)

#### 1. **Axios Configuration** ✅
**File:** `src/services/api.js`

```javascript
const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || "http://localhost:3000/api",
  headers: { "Content-Type": "application/json" },
  withCredentials: true,  // ✅ CRITICAL: Send cookies with requests
});

// Interceptor to handle token expiry
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      try {
        const response = await api.post("/auth/refresh");
        const { accessToken } = response.data;
        localStorage.setItem("accessToken", accessToken);
        
        // Retry original request
        return api(error.config);
      } catch (err) {
        window.location.href = "/auth/login";
      }
    }
    return Promise.reject(error);
  }
);
```

#### 2. **Environment Variables** ✅
**File:** `.env` (development) & `.env.production` (production)

```bash
# Development (.env)
REACT_APP_API_URL=http://localhost:3000/api

# Production (.env.production)
REACT_APP_API_URL=https://sdn-be-izcg.onrender.com/api
```

---

## 🧪 Testing Checklist

### Local Development (http://localhost:3001)
- [ ] User can login successfully
- [ ] `refreshToken` cookie is set in browser DevTools → Application → Cookies
- [ ] Cookie has: `httpOnly`, `path=/`, `same-site=lax`
- [ ] Call `POST /api/auth/refresh` returns new accessToken
- [ ] Logout clears cookie properly

### Production (https://frontend.com)
- [ ] Frontend is HTTPS
- [ ] Backend Render environment has `NODE_ENV=production`
- [ ] Backend logs show: `✓ CORS: credentials enabled, secure cookies support for production`
- [ ] `refreshToken` cookie shows: `secure`, `same-site=none`, `httpOnly`
- [ ] Network requests in DevTools show `Cookie: refreshToken=...` header

### Common Issues & Fixes

| Issue | Cause | Fix |
|-------|-------|-----|
| ❌ 401 when calling refresh | Cookie not sent | Set `withCredentials: true` in axios |
| ❌ Cookie not set in browser | `sameSite: "none"` without `secure` | Enable HTTPS + set `secure: true` |
| ❌ CORS error | Frontend not in allowedOrigins | Add frontend URL to `allowedOrigins` in app.js |
| ❌ Cookie lost on production | `NODE_ENV` not set to "production" | Set on Render dashboard |
| ❌ Refresh returns 401 | Token revoked (logged out) | User must login again |

---

## 🚀 Deployment Steps

### 1. Prepare Backend on Render

```bash
# Push to GitHub (with updated code)
git add .
git commit -m "fix: refresh token cookie configuration for production"
git push origin main
```

### 2. Set Environment Variables on Render Dashboard

Navigate to: **Settings** → **Environment**

```
NODE_ENV=production
CLIENT_URL=https://your-frontend-deploy-url.com
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/carRental
ACCESS_TOKEN_SECRET=<generate secure string>
REFRESH_TOKEN_SECRET=<generate secure string>
```

### 3. Deploy Backend

- Render automatically redeploys on git push
- Check deployment logs to verify `NODE_ENV=production`

### 4. Deploy Frontend

Update `.env.production` (or where frontend sets API URL):
```
REACT_APP_API_URL=https://your-backend-render-url.com/api
```

Build and deploy:
```bash
npm run build
# Deploy to Vercel/Netlify/etc
```

---

## 🔗 Related Files

- Backend CORS: [src/app.js](src/app.js)
- Auth Controller: [src/controllers/authController.js](src/controllers/authController.js)
- Auth Routes: [src/routes/authRoute.js](src/routes/authRoute.js)
- Frontend API: [../fe/src/services/api.js](../fe/src/services/api.js)

---

## 📚 References

- [MDN: Set-Cookie](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Set-Cookie)
- [MDN: SameSite Cookie Attribute](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Set-Cookie/SameSite)
- [Express Cookie Parser](https://github.com/expressjs/cookie-parser)
- [Axios Config Defaults](https://axios-http.com/docs/config_defaults)
