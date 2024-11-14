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
  isDefault: {
    type: String,
    enum: ["yes", "no"],
    required: true,
  },
});

module.exports = db.model("Semester", semesterSchema);
