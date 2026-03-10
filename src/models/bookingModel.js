const mongoose = require("mongoose");

const BookingSchema = new mongoose.Schema(
  {
    customerName: {
      type: String,
      required: [true, "Customer name is required"],
      trim: true,
    },
    carNumber: {
      type: String,
      required: [true, "Car number is required"],
      trim: true,
    },
    startDate: {
      type: Date,
      required: [true, "Start date is required"],
    },
    endDate: {
      type: Date,
      required: [true, "End date is required"],
    },
    totalAmount: {
      type: Number,
      default: 0,
    },
    status: {
      type: String,
      enum: {
        values: ["pending", "picked_up"],
        message: "Status must be: pending or picked_up",
      },
      default: "pending",
    },
    pickupDate: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// Validate: endDate must be after startDate
BookingSchema.pre("save", function (next) {
  if (this.endDate <= this.startDate) {
    return next(new Error("End date must be after start date"));
  }
  next();
});

module.exports = mongoose.model("Booking", BookingSchema);
