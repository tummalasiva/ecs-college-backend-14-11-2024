const mongoose = require("mongoose");

require("@db/employee/model");
require("@db/student/model");
require("@db/semester/model");

const mentorMenteeReportSchema = new mongoose.Schema({
  mentorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Employee",
    required: true,
  },
  semester: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Semester",
    required: true,
  },
  menteeId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Student",
    required: true,
  },
  files: [
    {
      type: String,
      default: "",
    },
  ],
  points: [
    {
      type: String,
    },
  ],
  date: {
    type: Date,
    default: Date.now,
  },
});

module.exports = db.model("MentorMenteeReport", mentorMenteeReportSchema);
