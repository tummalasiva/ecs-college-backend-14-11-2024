const mongoose = require("mongoose");

require("@db/employee/model");
require("@db/semester/model");

const reportSchema = new mongoose.Schema({
  date: {
    type: Date,
    required: true,
  },
  topic: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  files: [
    {
      type: String,
    },
  ],
  semester: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Semester",
    required: true,
  },
  addedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Employee",
    required: true,
  },
});

const facultyReportSchema = new mongoose.Schema({
  faculty: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Employee",
    required: true,
  },
  reports: [reportSchema],
});

module.exports = db.model("FacultyReport", facultyReportSchema);
