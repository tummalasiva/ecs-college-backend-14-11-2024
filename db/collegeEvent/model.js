const mongoose = require("mongoose");

require("@db/employee/model");
require("@db/department/model");

const collegeEventSchema = new mongoose.Schema({
  eventType: {
    type: String,
    enum: ["Industry Visits", "Workshops", "Talks/Lectures/Seminars"],
    required: true,
  },
  details: {
    type: String,
    required: true,
  },
  year: {
    type: String,
    required: true,
  },
  department: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Department",
    required: true,
  },
  file: {
    type: String,
    default: "",
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Employee",
    required: true,
  },
  approved: {
    type: Boolean,
    default: false,
  },
});

module.exports = db.model("CollegeEvent", collegeEventSchema);