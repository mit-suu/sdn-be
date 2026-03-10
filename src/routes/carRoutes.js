const express = require("express");
const router = express.Router();
const {
  getAllCars,
  getCarByNumber,
  createCar,
  updateCar,
  deleteCar,
} = require("../controllers/carController");

// GET    /cars           → Get all cars (optional ?status=available)
router.get("/", getAllCars);

// GET    /cars/:carNumber → Get single car
router.get("/:carNumber", getCarByNumber);

// POST   /cars           → Create new car
router.post("/", createCar);

// PUT    /cars/:carNumber → Update a car
router.put("/:carNumber", updateCar);

// DELETE /cars/:carNumber → Delete a car
router.delete("/:carNumber", deleteCar);

module.exports = router;
