const mongoose = require("mongoose");

const slotSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: [
      "Lecture",
      "Tutorial",
      "Lab",
      "Project",
      "Field trip",
      "Workshop",
      "Discussion",
      "Exam",
      "Break",
    ],
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
