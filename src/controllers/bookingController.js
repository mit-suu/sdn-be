const Booking = require("../models/bookingModel");
const Car = require("../models/carModel");

// Helper: calculate total amount
const calculateTotalAmount = (startDate, endDate, pricePerDay) => {
  const diffMs = new Date(endDate) - new Date(startDate);
  const days = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
  return days * pricePerDay;
};

// Helper: check booking overlap for a car (exclude a bookingId when updating)
const checkOverlap = async (carNumber, startDate, endDate, excludeId = null) => {
  const query = {
    carNumber,
    startDate: { $lt: new Date(endDate) },
    endDate: { $gt: new Date(startDate) },
  };
  if (excludeId) {
    query._id = { $ne: excludeId };
  }
  const conflict = await Booking.findOne(query);
  return conflict;
};

// ─────────────────────────────────────────────
// GET /bookings - Get all bookings
// ─────────────────────────────────────────────
const getAllBookings = async (req, res) => {
  try {
    const bookings = await Booking.find().sort({ createdAt: -1 });
    res.status(200).json({
      success: true,
      count: bookings.length,
      data: bookings,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─────────────────────────────────────────────
// GET /bookings/:bookingId - Get a single booking
// ─────────────────────────────────────────────
const getBookingById = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.bookingId);
    if (!booking) {
      return res.status(404).json({ success: false, message: "Booking not found" });
    }
    res.status(200).json({ success: true, data: booking });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─────────────────────────────────────────────
// POST /bookings - Create a new booking
// ─────────────────────────────────────────────
const createBooking = async (req, res) => {
  try {
    const { customerName, carNumber, startDate, endDate } = req.body;

    // 1. Validate required fields
    if (!customerName || !carNumber || !startDate || !endDate) {
      return res.status(400).json({
        success: false,
        message: "customerName, carNumber, startDate, endDate are all required",
      });
    }

    // 2. Validate date logic
    if (new Date(endDate) <= new Date(startDate)) {
      return res.status(400).json({
        success: false,
        message: "endDate must be after startDate",
      });
    }

    // 3. Check car exists and is available
    const car = await Car.findOne({ carNumber });
    if (!car) {
      return res.status(404).json({ success: false, message: `Car "${carNumber}" not found` });
    }
    if (car.status !== "available") {
      return res.status(400).json({
        success: false,
        message: `Car "${carNumber}" is currently ${car.status} and cannot be booked`,
      });
    }

    // 4. Check for booking overlap
    const conflict = await checkOverlap(carNumber, startDate, endDate);
    if (conflict) {
      return res.status(409).json({
        success: false,
        message: `Car "${carNumber}" is already booked from ${conflict.startDate.toISOString().split("T")[0]} to ${conflict.endDate.toISOString().split("T")[0]}`,
        conflictingBooking: conflict,
      });
    }

    // 5. Calculate totalAmount automatically
    const totalAmount = calculateTotalAmount(startDate, endDate, car.pricePerDay);

    // 6. Create the booking
    const booking = await Booking.create({
      customerName,
      carNumber,
      startDate,
      endDate,
      totalAmount,
    });

    // 7. Update car status to "rented"
    await Car.findOneAndUpdate({ carNumber }, { status: "rented" });

    res.status(201).json({
      success: true,
      message: "Booking created successfully",
      data: booking,
    });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// ─────────────────────────────────────────────
// PUT /bookings/:bookingId - Update a booking
// ─────────────────────────────────────────────
const updateBooking = async (req, res) => {
  try {
    const { bookingId } = req.params;
    const { customerName, carNumber, startDate, endDate } = req.body;

    // 1. Find existing booking
    const existingBooking = await Booking.findById(bookingId);
    if (!existingBooking) {
      return res.status(404).json({ success: false, message: "Booking not found" });
    }

    // Merge new values with existing ones
    const updatedCarNumber = carNumber || existingBooking.carNumber;
    const updatedStartDate = startDate || existingBooking.startDate;
    const updatedEndDate = endDate || existingBooking.endDate;

    // 2. Validate date logic
    if (new Date(updatedEndDate) <= new Date(updatedStartDate)) {
      return res.status(400).json({
        success: false,
        message: "endDate must be after startDate",
      });
    }

    // 3. Check car exists
    const car = await Car.findOne({ carNumber: updatedCarNumber });
    if (!car) {
      return res.status(404).json({
        success: false,
        message: `Car "${updatedCarNumber}" not found`,
      });
    }

    // 4. Check overlap (exclude current booking)
    const conflict = await checkOverlap(updatedCarNumber, updatedStartDate, updatedEndDate, bookingId);
    if (conflict) {
      return res.status(409).json({
        success: false,
        message: `Car "${updatedCarNumber}" is already booked during this period`,
        conflictingBooking: conflict,
      });
    }

    // 5. Recalculate totalAmount
    const totalAmount = calculateTotalAmount(updatedStartDate, updatedEndDate, car.pricePerDay);

    // 6. Update booking
    const updatedBooking = await Booking.findByIdAndUpdate(
      bookingId,
      {
        customerName: customerName || existingBooking.customerName,
        carNumber: updatedCarNumber,
        startDate: updatedStartDate,
        endDate: updatedEndDate,
        totalAmount,
      },
      { new: true, runValidators: true }
    );

    res.status(200).json({
      success: true,
      message: "Booking updated successfully",
      data: updatedBooking,
    });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// ─────────────────────────────────────────────
// PUT /bookings/:bookingId/pickup - Pickup car (nhận xe)
// ─────────────────────────────────────────────
const pickupBooking = async (req, res) => {
  try {
    const { bookingId } = req.params;

    // 1. Find existing booking
    const booking = await Booking.findById(bookingId);
    if (!booking) {
      return res.status(404).json({ success: false, message: "Booking not found" });
    }

    // 2. Check if already picked up
    if (booking.status === "picked_up") {
      return res.status(400).json({
        success: false,
        message: "This booking has already been picked up",
        pickupDate: booking.pickupDate,
      });
    }

    // 3. Validate: current time must be >= startDate
    const now = new Date();
    if (now < new Date(booking.startDate)) {
      return res.status(400).json({
        success: false,
        message: `Cannot pickup before start date. Start date is ${booking.startDate.toISOString().split("T")[0]}, current time is ${now.toISOString()}`,
      });
    }

    // 4. Update booking: status → "picked_up", pickupDate → now
    const updatedBooking = await Booking.findByIdAndUpdate(
      bookingId,
      {
        status: "picked_up",
        pickupDate: now,
      },
      { new: true, runValidators: true }
    );

    res.status(200).json({
      success: true,
      message: "Car picked up successfully",
      data: updatedBooking,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─────────────────────────────────────────────
// DELETE /bookings/:bookingId - Delete a booking
// ─────────────────────────────────────────────
const deleteBooking = async (req, res) => {
  try {
    const booking = await Booking.findByIdAndDelete(req.params.bookingId);
    if (!booking) {
      return res.status(404).json({ success: false, message: "Booking not found" });
    }

    // Set car status back to "available" if no other active bookings exist
    const otherBookings = await Booking.findOne({
      carNumber: booking.carNumber,
      endDate: { $gt: new Date() },
    });
    if (!otherBookings) {
      await Car.findOneAndUpdate({ carNumber: booking.carNumber }, { status: "available" });
    }

    res.status(200).json({
      success: true,
      message: "Booking deleted successfully",
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  getAllBookings,
  getBookingById,
  createBooking,
  updateBooking,
  pickupBooking,
  deleteBooking,
};
