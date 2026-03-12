const jwt = require("jsonwebtoken");
const User = require("../models/userModel");

// ─── Helpers ────────────────────────────────────────────────────────────────

const generateAccessToken = (userId) =>
  jwt.sign({ id: userId }, process.env.ACCESS_TOKEN_SECRET, {
    expiresIn: process.env.ACCESS_TOKEN_EXPIRES_IN || "15m",
  });

const generateRefreshToken = (userId) =>
  jwt.sign({ id: userId }, process.env.REFRESH_TOKEN_SECRET, {
    expiresIn: process.env.REFRESH_TOKEN_EXPIRES_IN || "7d",
  });

const setRefreshTokenCookie = (res, token) => {
  const isProduction = process.env.NODE_ENV === "production";
  
  res.cookie("refreshToken", token, {
    httpOnly: true,
    secure: isProduction, // REQUIRED: Must be true when sameSite is "none"
    sameSite: isProduction ? "none" : "lax", // "none" for cross-origin in production, "lax" for development
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    path: "/", // Ensure cookie is sent for all paths
  });
};

// ─── Controllers ────────────────────────────────────────────────────────────

/**
 * POST /auth/register
 */
const register = async (req, res) => {
  try {
    const { username, email, password } = req.body;

    // Validate input
    if (!username || !email || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }

    // Kiểm tra user đã tồn tại chưa
    const existingUser = await User.findOne({
      $or: [{ email }, { username }],
    });

    if (existingUser) {
      const field = existingUser.email === email ? "Email" : "Username";
      return res.status(409).json({ message: `${field} already exists` });
    }

    // Tạo user mới
    const user = await User.create({ username, email, password });

    // Tạo tokens
    const refreshToken = generateRefreshToken(user._id);

    // Lưu refreshToken vào DB
    user.refreshToken = refreshToken;
    await user.save();

    // Gửi refreshToken qua httpOnly cookie
    setRefreshTokenCookie(res, refreshToken);

    return res.status(201).json({
      message: "User registered successfully",
      user,
    });
  } catch (error) {
    if (error.name === "ValidationError") {
      const messages = Object.values(error.errors).map((e) => e.message);
      return res.status(400).json({ message: messages.join(", ") });
    }
    console.error("Register error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

/**
 * POST /auth/login
 */
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required" });
    }

    // Tìm user (include password field để so sánh)
    const user = await User.findOne({ email }).select("+password");
    if (!user) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    // Kiểm tra password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    // Tạo tokens
    const accessToken = generateAccessToken(user._id);
    const refreshToken = generateRefreshToken(user._id);

    // Cập nhật refreshToken trong DB
    user.refreshToken = refreshToken;
    await user.save();

    setRefreshTokenCookie(res, refreshToken);

    return res.status(200).json({
      message: "Login successful",
      user,
      accessToken,
    });
  } catch (error) {
    console.error("Login error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

/**
 * POST /auth/logout
 */
const logout = async (req, res) => {
  try {
    const token = req.cookies?.refreshToken;

    if (!token) {
      return res.status(204).send(); // No content - already logged out
    }

    // Xóa refreshToken trong DB
    await User.findOneAndUpdate(
      { refreshToken: token },
      { refreshToken: null }
    );

    // Xóa cookie (MUST match setRefreshTokenCookie options)
    const isProduction = process.env.NODE_ENV === "production";
    res.clearCookie("refreshToken", {
      httpOnly: true,
      secure: isProduction,
      sameSite: isProduction ? "none" : "lax",
      path: "/",
    });

    return res.status(200).json({ message: "Logged out successfully" });
  } catch (error) {
    console.error("Logout error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

/**
 * POST /auth/refresh
 * Dùng refreshToken (từ cookie) để lấy accessToken mới
 */
const refresh = async (req, res) => {
  try {
    const token = req.cookies?.refreshToken;

    if (!token) {
      return res.status(401).json({ message: "Refresh token not found" });
    }

    // Verify token
    let decoded;
    try {
      decoded = jwt.verify(token, process.env.REFRESH_TOKEN_SECRET);
    } catch (err) {
      return res.status(403).json({ message: "Invalid or expired refresh token" });
    }

    // Kiểm tra token có trong DB không (đã logout chưa)
    const user = await User.findOne({ _id: decoded.id, refreshToken: token });
    if (!user) {
      return res.status(403).json({ message: "Refresh token revoked" });
    }

    // Rotate refresh token (bảo mật tốt hơn)
    const newAccessToken = generateAccessToken(user._id);
    const newRefreshToken = generateRefreshToken(user._id);

    user.refreshToken = newRefreshToken;
    await user.save();

    setRefreshTokenCookie(res, newRefreshToken);

    return res.status(200).json({
      message: "Token refreshed",
      accessToken: newAccessToken,
    });
  } catch (error) {
    console.error("Refresh error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

module.exports = { register, login, logout, refresh };
