const mongoose = require("mongoose");

require("@db/transport/vehicle/model");
require("@db/transport/firm/model");

const vehicleFuelSchema = new mongoose.Schema({
  receipt: {
    type: String,
    default: "",
  },
  vehicle: {
    type: String,
    ref: "Vehicle",
    required: true,
  },
  firm: {
    type: String,
    ref: "Firm",
    required: true,
  },
  date: {
    type: Date,
    required: true,
  },
  billNo: {
    type: String,
    required: true,
  },
  fuelQuantity: {
    type: String,
    required: true,
  },
  rate: {
    type: String,
    required: true,
  },
  amount: {
    type: String,
    required: true,
  },
  kiloMeter: {
    type: String,
    required: true,
  },
});

const Fuel = db.model("Fuel", vehicleFuelSchema);

module.exports = Fuel;
