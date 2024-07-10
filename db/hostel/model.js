const mongoose = require("mongoose");

require("@db/school/model");
require("@db/employee/model");

const hostelSchema = new mongoose.Schema({
  name: {
    type: String,
    trim: true,
    required: true,
    maxLength: 100,
  },
  type: {
    type: String,
    enum: {
      values: ["Boys", "Girls", "Combined"],
      message: "Please select a valid hostel type",
    },
    default: "Boys",
  },
  warden: {
    type: mongoose.Types.ObjectId,
    ref: "Employee",
    required: true,
  },
  address: {
    type: String,
    required: true,
    maxLength: 500,
    trim: true,
  },
  contactNumber: {
    type: Number,
    required: true,
  },
  note: {
    type: String,
    default: "",
  },
});

const Hostel = db.model("Hostel", hostelSchema);

module.exports = Hostel;
