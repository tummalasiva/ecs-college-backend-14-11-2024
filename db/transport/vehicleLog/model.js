const mongoose = require("mongoose");

require("@db/employee/model");
require("@db/transport/vehicle/model");
require("@db/transport/route/model");

const spareUseSchema = new mongoose.Schema({
  distance: {
    type: String,
    required: true,
  },
  reason: {
    type: String,
    required: true,
  },
});

const readingSchema = new mongoose.Schema({
  image: {
    type: String,
    default: "",
  },
  reading: {
    type: Number,
    required: true,
  },
});

const vehicleLogSchema = new mongoose.Schema({
  route: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: "Route",
  },

  vehicle: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: "Vehicle",
  },

  date: {
    type: Date,
    default: Date.now,
  },

  departureTime: {
    type: String,
    required: true,
  },

  arrivalTime: {
    type: String,
  },

  readingAtDeparture: readingSchema,

  readingAtArrival: readingSchema,

  totalDistanceTravelled: {
    type: Number,
    default: 0,
  },

  spareUse: {
    type: spareUseSchema,
    default: null,
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: "Employee",
  },
  tripCompleted: {
    type: Boolean,
    default: false,
  },
});

const VehicleLog = db.model("VehicleLog", vehicleLogSchema);

module.exports = VehicleLog;
