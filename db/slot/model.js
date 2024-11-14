const mongoose = require("mongoose");

const slotTypes = [
  "Class",
  "Exam",
  // "External Exam",
  // "Lab Session",
  // "Seminar",
  // "Workshop",
  // "Guest Lecture",
  // "Practical",
  // "Event",
  // "Meeting",
  // "Conference",
  // "Orientation",
  // "Sports Event",
  // "Cultural Event",
  // "Training",
];

const slotSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: slotTypes,
    required: true,
  },
  startTime: {
    type: String,
    required: true,
  },
  endTime: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    default: "",
  },
});

module.exports = db.model("Slot", slotSchema);
