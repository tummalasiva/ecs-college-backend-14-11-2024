const mongoose = require("mongoose");

const routeStopSchema = new mongoose.Schema({
  name: {
    type: String,
    trim: true,
    maxLength: 200,
    required: true,
  },
  stopKM: {
    type: String,
    trim: true,
    maxLength: 100,
  },
  pickTime: {
    type: String,
    required: true,
  },
  pickEndTime: {
    type: String,
    required: true,
  },
  dropTime: {
    type: String,
    required: true,
  },
  dropEndTime: {
    type: String,
    required: true,
  },
});

const Stop = db.model("Stop", routeStopSchema);

module.exports = Stop;
