const mongoose = require("mongoose");

require("@db/building/model");
require("@db/employee/model");

const messSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  hostel: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Building",
  },
  capacity: {
    type: Number,
    required: true,
  },
  incharge: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Employee",
  },
  workers: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Employee",
    },
  ],
  mealTypes: [
    {
      type: String,
      enum: ["Breakfast", "Lunch", "Dinner", "Snacks"],
      required: true,
    },
  ],
  facilities: [
    {
      type: String,
      enum: ["Vegetarian", "Non-Vegetarian", "Special Diets"],
      // Example: "Vegetarian", "Non-Vegetarian", "Special Diets"
    },
  ],
});

module.exports = db.model("Mess", messSchema);
