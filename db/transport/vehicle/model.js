const mongoose = require("mongoose");

require("@db/employee/model");

const vehicleSchema = new mongoose.Schema({
  number: {
    type: String,
    required: [true, "Provide vehicle number"],
  },
  model: {
    type: String,
    maxLength: 100,
  },
  driver: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Employee",
    required: [true, "Provide driver"],
  },
  licenseNumber: {
    type: String,
    maxLength: 100,
  },
  driverContactNumber: {
    type: Number,
    required: [true, "Provide driver contact number"],
  },
  trackingId: {
    type: String,
    default: "",
  },
  insuranceName: {
    type: String,
    required: [true, "Provide Insurance Name"],
  },
  insuranceId: {
    type: String,
    required: [true, "Provide Insurance Id"],
  },
  totalSeats: {
    type: String,
    required: true,
  },
  note: {
    type: String,
    default: "",
  },
});
const Vehicle = db.model("Vehicle", vehicleSchema);

module.exports = Vehicle;
