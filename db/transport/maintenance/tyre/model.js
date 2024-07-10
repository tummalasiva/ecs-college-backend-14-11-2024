const mongoose = require("mongoose");

require("@db/transport/vehicle/model");
require("@db/transport/firm/model");

const tyreAndResoleSchema = new mongoose.Schema({
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
  kmReading: {
    type: String,
    required: true,
  },
  kmRun: {
    type: String,
    required: true,
  },
  tyre: {
    type: String,
    required: true,
  },
  rate: {
    type: String,
    required: true,
  },
  tyreNo: {
    type: String,
    required: true,
  },

  amount: {
    type: String,
    required: true,
  },
});

const Tyre = db.model("Tyre", tyreAndResoleSchema);

module.exports = Tyre;
