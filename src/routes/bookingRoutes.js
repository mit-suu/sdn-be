const express = require("express");
const router = express.Router();
const {
  getAllBookings,
  getBookingById,
  createBooking,
  updateBooking,
  pickupBooking,
  deleteBooking,
} = require("../controllers/bookingController");

// GET    /bookings              → Get all bookings
router.get("/", getAllBookings);

// GET    /bookings/:bookingId   → Get single booking
router.get("/:bookingId", getBookingById);

// POST   /bookings              → Create new booking
router.post("/", createBooking);

// PUT    /bookings/:bookingId   → Update a booking
router.put("/:bookingId", updateBooking);

// PUT    /bookings/:bookingId/pickup → Pickup car (nhận xe)
router.put("/:bookingId/pickup", pickupBooking);

// DELETE /bookings/:bookingId   → Delete a booking
router.delete("/:bookingId", deleteBooking);

module.exports = router;

