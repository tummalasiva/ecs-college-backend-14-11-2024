const mongoose = require("mongoose");

require("@db/transport/vehicle/model");

const greecingSchema = new mongoose.Schema({
  vehicle: {
    type: String,
    ref: "Vehicle",
    required: true,
  },
  date: {
    type: Date,
    required: true,
  },
  amount: {
    type: String,
    required: true,
  },
});

const Greecing = db.model("Greecing", greecingSchema);

module.exports = Greecing;
