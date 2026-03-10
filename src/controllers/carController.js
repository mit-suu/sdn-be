const Car = require("../models/carModel");

// GET /cars - Get all cars
const getAllCars = async (req, res) => {
  try {
    const { status } = req.query;
    const filter = status ? { status } : {};
    const cars = await Car.find(filter).sort({ createdAt: -1 });
    res.status(200).json({
      success: true,
      count: cars.length,
      data: cars.map((car) => ({
        _id: car._id,
        carNumber: car.carNumber,
        capacity: car.capacity,
        status: car.status,
        pricePerDay: car.pricePerDay,
        features: car.features,
        image: car.image || null,
        createdAt: car.createdAt,
        updatedAt: car.updatedAt,
      })),
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// GET /cars/:carNumber - Get a single car by carNumber
const getCarByNumber = async (req, res) => {
  try {
    const car = await Car.findOne({ carNumber: req.params.carNumber });
    if (!car) {
      return res.status(404).json({ success: false, message: "Car not found" });
    }
    res.status(200).json({
      success: true,
      data: {
        _id: car._id,
        carNumber: car.carNumber,
        capacity: car.capacity,
        status: car.status,
        pricePerDay: car.pricePerDay,
        features: car.features,
        image: car.image || null,
        createdAt: car.createdAt,
        updatedAt: car.updatedAt,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// POST /cars - Create a new car
const createCar = async (req, res) => {
  try {
    const { carNumber, capacity, status, pricePerDay, features, image } = req.body;

    // Check duplicate carNumber
    const existingCar = await Car.findOne({ carNumber });
    if (existingCar) {
      return res.status(400).json({
        success: false,
        message: `Car with number "${carNumber}" already exists`,
      });
    }

    const car = await Car.create({ carNumber, capacity, status, pricePerDay, features, image });
    res.status(201).json({
      success: true,
      message: "Car created successfully",
      data: {
        _id: car._id,
        carNumber: car.carNumber,
        capacity: car.capacity,
        status: car.status,
        pricePerDay: car.pricePerDay,
        features: car.features,
        image: car.image || null,
        createdAt: car.createdAt,
        updatedAt: car.updatedAt,
      },
    });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// PUT /cars/:carNumber - Update a car
const updateCar = async (req, res) => {
  try {
    const car = await Car.findOneAndUpdate(
      { carNumber: req.params.carNumber },
      req.body,
      { new: true, runValidators: true }
    );
    if (!car) {
      return res.status(404).json({ success: false, message: "Car not found" });
    }
    res.status(200).json({
      success: true,
      message: "Car updated successfully",
      data: {
        _id: car._id,
        carNumber: car.carNumber,
        capacity: car.capacity,
        status: car.status,
        pricePerDay: car.pricePerDay,
        features: car.features,
        image: car.image || null,
        createdAt: car.createdAt,
        updatedAt: car.updatedAt,
      },
    });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// DELETE /cars/:carNumber - Delete a car
const deleteCar = async (req, res) => {
  try {
    const car = await Car.findOneAndDelete({ carNumber: req.params.carNumber });
    if (!car) {
      return res.status(404).json({ success: false, message: "Car not found" });
    }
    res.status(200).json({ success: true, message: "Car deleted successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { getAllCars, getCarByNumber, createCar, updateCar, deleteCar };