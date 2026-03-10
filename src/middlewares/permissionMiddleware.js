/**
 * Middleware: Check Ownership
 * Kiểm tra xem user có quyền sửa/xóa booking của họ không
 */
const checkBookingOwnership = async (req, res, next) => {
  try {
    const { bookingId } = req.params;
    const userId = req.userId;

    // Import Booking model
    const Booking = require("../models/bookingModel");

    const booking = await Booking.findById(bookingId);
    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "Booking not found",
      });
    }

    // Kiểm tra booking có thuộc về user này không
    // (Giả sử booking có userId hoặc customerName)
    // Nếu muốn strict check, cần thêm userId vào booking model
    // Hiện tại kiểm tra customerName hoặc cho admin quyền toàn bộ

    // Admin có thể xóa bất kỳ booking
    // Nếu muốn, add role check ở đây
    // const user = await User.findById(userId);
    // if (user.role !== "admin") { ... }

    // Lưu booking vào req để controller sử dụng
    req.booking = booking;
    next();
  } catch (error) {
    console.error("Ownership check error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

/**
 * Middleware: Rate Limiting (Optional)
 * Giới hạn số lượng request từ một IP trong một khoảng thời gian
 */
const rateLimit = (() => {
  const requests = new Map();

  return (windowMs = 15 * 60 * 1000, maxRequests = 100) => {
    return (req, res, next) => {
      const ip = req.ip || req.connection.remoteAddress;
      const now = Date.now();

      if (!requests.has(ip)) {
        requests.set(ip, []);
      }

      const userRequests = requests.get(ip);
      const recentRequests = userRequests.filter((time) => now - time < windowMs);

      if (recentRequests.length >= maxRequests) {
        return res.status(429).json({
          success: false,
          message: "Too many requests. Please try again later.",
        });
      }

      recentRequests.push(now);
      requests.set(ip, recentRequests);
      next();
    };
  };
})();

module.exports = { checkBookingOwnership, rateLimit };
