const mongoose = require("mongoose");
require("@db/school/model");
require("@db/employee/model");

const ticketSchema = new mongoose.Schema({
  schoolId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "School",
    required: [true, "Provide school Id"],
  },
  subject: {
    type: String,
    required: [true, "Provide subject"],
  },
  problem: {
    type: String,
    required: [true, "Provide context of the problem"],
  },
  resolvedStatus: {
    type: String,
    enum: {
      values: ["pending", "completed", "inProgress"],
      message: "Select a valid resolution status",
    },
    default: "pending",
  },
  resolvedAt: {
    type: Date,
    default: null,
  },
  files: {
    type: [String],
    default: [],
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Employee",
    default: null,
  },
});

const Ticket = db.model("Ticket", ticketSchema);

module.exports = Ticket;
