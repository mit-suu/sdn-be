const mongoose = require("mongoose");

const CarSchema = new mongoose.Schema(
  {
    carNumber: {
      type: String,
      required: [true, "Car number is required"],
      unique: true,
      trim: true,
    },
    capacity: {
      type: Number,
      required: [true, "Capacity is required"],
      min: [1, "Capacity must be at least 1"],
    },
    status: {
      type: String,
      enum: {
        values: ["available", "rented", "maintenance"],
        message: "Status must be: available, rented, or maintenance",
      },
      default: "available",
    },
    pricePerDay: {
      type: Number,
      required: [true, "Price per day is required"],
      min: [0, "Price must be a positive number"],
    },
    features: {
      type: [String],
      default: [],
    },
    image: {
      type: String,
      default: "",
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Car", CarSchema);