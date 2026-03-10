const jwt = require("jsonwebtoken");

/**
 * Middleware: Verify Access Token (JWT)
 * Kiểm tra và xác thực JWT từ Authorization header
 */
const verifyToken = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      return res.status(401).json({
        message: "Access token is missing",
      });
    }

    // Lấy token từ "Bearer {token}"
    const token = authHeader.split(" ")[1];
    if (!token) {
      return res.status(401).json({
        message: "Invalid authorization format. Use: Bearer {token}",
      });
    }

    // Verify token
    try {
      const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
      // Lưu userId vào req object để sử dụng ở controllers
      req.userId = decoded.id;
      next();
    } catch (error) {
      if (error.name === "TokenExpiredError") {
        return res.status(401).json({
          message: "Access token has expired. Please refresh your token.",
        });
      }
      return res.status(403).json({
        message: "Invalid access token",
      });
    }
  } catch (error) {
    console.error("Auth middleware error:", error);
    return res.status(500).json({
      message: "Internal server error",
    });
  }
};

/**
 * Middleware: Optional Token (không bắt buộc)
 * Nếu có token thì verify, không có thì pass
 */
const optionalToken = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      req.userId = null;
      return next();
    }

    const token = authHeader.split(" ")[1];
    if (!token) {
      req.userId = null;
      return next();
    }

    try {
      const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
      req.userId = decoded.id;
      next();
    } catch (error) {
      // Nếu token invalid, pass qua (không authenticated)
      req.userId = null;
      next();
    }
  } catch (error) {
    req.userId = null;
    next();
  }
};

module.exports = { verifyToken, optionalToken };
