const mongoose = require("mongoose");

require("@db/student/model");
require("@db/academicYear/model");
require("@db/employee/model");
require("@db/school/model");

const studentActivitySchema = new mongoose.Schema({
  school: {
    type: mongoose.Types.ObjectId,
    ref: "School",
    required: true,
  },
  date: {
    type: Date,
    default: Date.now,
  },
  name: {
    type: String,
    trim: true,
    required: true,
  },
  description: {
    type: String,
    default: "",
  },
  student: {
    type: mongoose.Types.ObjectId,
    ref: "Student",
    required: [true, "Please mention student"],
  },
  academicYear: {
    type: mongoose.Types.ObjectId,
    ref: "AcademicYear",
    required: [true, "Please provide academic year"],
  },
  addedBy: {
    type: mongoose.Types.ObjectId,
    ref: "Employee",
    required: [true, "Please provide addedBy"],
  },
});

const StudentActivity = db.model("StudentActivity", studentActivitySchema);

module.exports = StudentActivity;
