const mongoose = require("mongoose");

require("@db/mess/model");
require("@db/messItem/model");

const messMenuSchema = new mongoose.Schema({
  mess: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Mess",
    required: true,
  },
  day: {
    type: String,
    enum: [
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday",
      "Sunday",
    ],
    required: true,
  },
  time: {
    type: String,
    required: true,
  },
  mealType: {
    type: String,
    enum: ["Breakfast", "Lunch", "Dinner", "Snacks"],
    required: true,
  },
  items: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "MessItem",
      required: true,
    },
  ],
});

module.exports = db.model("MessMenu", messMenuSchema);
