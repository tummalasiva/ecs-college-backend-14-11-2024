const mongoose = require("mongoose");

require("@db/transport/vehicle/model");
require("@db/transport/firm/model");

const repairSchema = new mongoose.Schema({
  vehicle: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Vehicle",
    required: true,
  },
  firm: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Firm",
    required: true,
  },
  date: {
    type: Date,
    required: true,
  },
  particulars: {
    type: String,
    required: true,
  },
  amount: {
    type: String,
    required: true,
  },
});

const Repair = db.model("Repair", repairSchema);

module.exports = Repair;
