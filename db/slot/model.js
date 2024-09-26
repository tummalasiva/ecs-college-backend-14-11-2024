const mongoose = require("mongoose");

const slotSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ["Class Routine", "Exam"],
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
