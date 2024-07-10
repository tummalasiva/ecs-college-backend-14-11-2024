const mongoose = require("mongoose");

require("@db/transport/vehicle/model");
require("@db/transport/stop/model");

const routeSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  vehicle: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: "Vehicle",
  },
  routeStart: {
    type: String,
    required: [true, "Provide route start"],
  },
  routeEnd: {
    type: String,
    required: [true, "Provide route end"],
  },
  pickStart: {
    type: String,
    required: [true, "Provide pick start"],
  },
  pickEnd: {
    type: String,
    required: [true, "Provide pick end"],
  },
  dropStart: {
    type: String,
    required: [true, "Provide drop start"],
  },
  dropEnd: {
    type: String,
    required: [true, "Provide drop end"],
  },
  stops: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Stop",
      required: true,
    },
  ],
  note: {
    type: String,
    trim: true,
    maxLength: 200,
  },
});

const Route = db.model("Route", routeSchema);

module.exports = Route;
