const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const cookieParser = require("cookie-parser");
require("dotenv").config();

const carRoutes = require("./routes/carRoutes");
const bookingRoutes = require("./routes/bookingRoutes");
const authRoutes = require("./routes/authRoute");

const app = express();

// CORS — cho phép frontend gọi vào (với credentials)
const clientUrl = (process.env.CLIENT_URL || "http://localhost:3000").replace(/\/+$/, ""); // Remove trailing slash
console.log("🌐 Allowed CORS origin:", clientUrl);

app.use(
  cors({
    origin: clientUrl,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true, // Cho phép gửi/nhận cookies
  })
);

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser()); // Parse cookies

// Routes with /api prefix
app.use("/api/cars", carRoutes);
app.use("/api/bookings", bookingRoutes);
app.use("/api/auth", authRoutes);

// Health check
app.get("/", (req, res) => {
  res.json({ message: "Car Rental API is running!" });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ success: false, message: "Route not found" });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ success: false, message: "Internal Server Error", error: err.message });
});

// Connect to MongoDB
const PORT = process.env.PORT || 3000;
const MONGODB_URI = process.env.MONGODB_URI;

// Start server immediately so Render can detect the open port
app.listen(PORT, () => {
  console.log(`🚀 Server is running on port ${PORT}`);
});

// Connect to MongoDB async
mongoose
  .connect(MONGODB_URI)
  .then(() => {
    console.log("✅ Connected to MongoDB");
  })
  .catch((err) => {
    console.error("❌ MongoDB connection error:", err.message);
  });