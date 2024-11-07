const mongoose = require("mongoose");

require("@db/employee/model");

const proctorMessageSchema = new mongoose.Schema({
  message: {
    type: String,
    required: true,
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Employee",
    required: true,
  },
});

module.exports = db.model("ProctorMessage", proctorMessageSchema);
