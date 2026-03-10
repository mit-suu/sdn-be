/**
 * SEED SCRIPT — Chèn dữ liệu mẫu vào MongoDB
 *
 * Cách chạy:
 *   node seed.js          → xoá data cũ rồi chèn mới
 *   node seed.js --append → giữ data cũ, chỉ thêm vào
 */

require("dotenv").config();
const mongoose = require("mongoose");
const Car = require("./models/carModel");
const Booking = require("./models/bookingModel");

// ─── DỮ LIỆU MẪU ────────────────────────────────────────────────────────────

const CARS = [
  {
    carNumber: "51A-12345",
    capacity: 4,
    status: "available",
    pricePerDay: 500000,
    features: ["automatic", "air-conditioner", "bluetooth"],
    image: "https://images.unsplash.com/photo-1555215695-3004980ad54e?w=600&auto=format&fit=crop",
  },
  {
    carNumber: "51B-67890",
    capacity: 7,
    status: "available",
    pricePerDay: 800000,
    features: ["automatic", "air-conditioner", "GPS", "camera-360"],
    image: "https://images.unsplash.com/photo-1519641471654-76ce0107ad1b?w=600&auto=format&fit=crop",
  },
  {
    carNumber: "51C-11111",
    capacity: 4,
    status: "rented",
    pricePerDay: 450000,
    features: ["manual", "air-conditioner"],
    image: "https://images.unsplash.com/photo-1494976388531-d1058494cdd8?w=600&auto=format&fit=crop",
  },
  {
    carNumber: "51D-22222",
    capacity: 16,
    status: "available",
    pricePerDay: 1500000,
    features: ["automatic", "air-conditioner", "GPS", "wifi", "USB"],
    image: "https://images.unsplash.com/photo-1544636331-e26879cd4d9b?w=600&auto=format&fit=crop",
  },
  {
    carNumber: "51E-33333",
    capacity: 7,
    status: "maintenance",
    pricePerDay: 750000,
    features: ["automatic", "air-conditioner", "GPS"],
    image: "https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?w=600&auto=format&fit=crop",
  },
  {
    carNumber: "51F-44444",
    capacity: 4,
    status: "available",
    pricePerDay: 600000,
    features: ["automatic", "air-conditioner", "sunroof", "bluetooth"],
    image: "https://images.unsplash.com/photo-1502877338535-766e1452684a?w=600&auto=format&fit=crop",
  },
  {
    carNumber: "51G-55555",
    capacity: 4,
    status: "available",
    pricePerDay: 350000,
    features: ["manual", "air-conditioner"],
    image: "https://images.unsplash.com/photo-1541899481282-d53bffe3c35d?w=600&auto=format&fit=crop",
  },
];

// Helper tạo ngày tương đối từ hôm nay
const daysFromNow = (n) => {
  const d = new Date();
  d.setDate(d.getDate() + n);
  return d;
};

const BOOKINGS = [
  {
    customerName: "Nguyễn Văn An",
    carNumber: "51C-11111",
    startDate: daysFromNow(-2),
    endDate: daysFromNow(1),
    // totalAmount sẽ tính sau khi biết pricePerDay
  },
  {
    customerName: "Trần Thị Bình",
    carNumber: "51A-12345",
    startDate: daysFromNow(3),
    endDate: daysFromNow(6),
  },
  {
    customerName: "Lê Minh Cường",
    carNumber: "51B-67890",
    startDate: daysFromNow(5),
    endDate: daysFromNow(10),
  },
  {
    customerName: "Phạm Thị Dung",
    carNumber: "51D-22222",
    startDate: daysFromNow(-10),
    endDate: daysFromNow(-5),
  },
  {
    customerName: "Hoàng Văn Em",
    carNumber: "51F-44444",
    startDate: daysFromNow(1),
    endDate: daysFromNow(4),
  },
];

// ─── HÀM TÍNH TIỀN ───────────────────────────────────────────────────────────

const calcTotal = (startDate, endDate, pricePerDay) => {
  const days = Math.ceil((new Date(endDate) - new Date(startDate)) / (1000 * 60 * 60 * 24));
  return days * pricePerDay;
};

// ─── MAIN ────────────────────────────────────────────────────────────────────

async function seed() {
  const appendMode = process.argv.includes("--append");

  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("✅ Kết nối MongoDB thành công\n");

    // Xoá data cũ nếu không phải append mode
    if (!appendMode) {
      await Car.deleteMany({});
      await Booking.deleteMany({});
      console.log("🗑  Đã xoá dữ liệu cũ\n");
    }

    // ── Insert Cars ──────────────────────────────────────
    console.log("🚗 Đang thêm xe...");
    const insertedCars = await Car.insertMany(CARS);
    console.log(`   ✔ Đã thêm ${insertedCars.length} xe:`);
    insertedCars.forEach((c) =>
      console.log(`     • ${c.carNumber} — ${c.status} — ${c.pricePerDay.toLocaleString("vi-VN")}₫/ngày`)
    );

    // ── Insert Bookings ──────────────────────────────────
    console.log("\n📋 Đang thêm booking...");

    // Gắn totalAmount tự động dựa vào pricePerDay của xe
    const carMap = {};
    insertedCars.forEach((c) => { carMap[c.carNumber] = c.pricePerDay; });

    const bookingsWithAmount = BOOKINGS.map((b) => ({
      ...b,
      totalAmount: calcTotal(b.startDate, b.endDate, carMap[b.carNumber] || 0),
    }));

    const insertedBookings = await Booking.insertMany(bookingsWithAmount);
    console.log(`   ✔ Đã thêm ${insertedBookings.length} booking:`);
    insertedBookings.forEach((b) =>
      console.log(
        `     • ${b.customerName} — ${b.carNumber} — ${b.totalAmount.toLocaleString("vi-VN")}₫`
      )
    );

    // ── Tổng kết ─────────────────────────────────────────
    console.log("\n──────────────────────────────────────────");
    console.log(`🎉 Seed hoàn tất!`);
    console.log(`   Xe:      ${insertedCars.length} records`);
    console.log(`   Booking: ${insertedBookings.length} records`);
    console.log("──────────────────────────────────────────\n");

  } catch (err) {
    console.error("❌ Seed thất bại:", err.message);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    console.log("🔌 Đã ngắt kết nối MongoDB");
  }
}

seed();