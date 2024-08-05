const mongoose = require("mongoose");

require("@db/school/model");

const eventSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    maxLength: 1000,
  },
  startTime: {
    type: String,
    required: true,
  },
  endTime: {
    type: String,
    required: true,
  },
});

const calenderEventSchema = new mongoose.Schema({
  school: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "School",
    required: true,
  },
  date: {
    type: Date,
    required: true,
    unique: true,
  },
  events: [eventSchema],
});

module.exports = db.model("CalendarEvent", calenderEventSchema);
