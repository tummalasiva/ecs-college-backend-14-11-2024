const mongoose = require("mongoose");

require("@db/academicYear/model");

const semesterSchema = new mongoose.Schema({
  semesterName: {
    type: String,
    required: true, // Fall Semested || Winter Semester || Tri Semester || Fast Track Semester
  },
  academicYear: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "AcademicYear",
    required: true,
  },
  from: {
    type: Date,
    required: true,
  },
  to: {
    type: Date,
    required: true,
  },
  status: {
    type: String,
    enum: ["active", "inactive", "completed"],
    default: "active",
  },
});

module.exports = db.model("Semester", semesterSchema);
