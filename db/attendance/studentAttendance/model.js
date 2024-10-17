const mongoose = require("mongoose");

require("@db/subject/model");
require("@db/school/model");
require("@db/student/model");
require("@db/employee/model");
require("@db/degreeCode/model");
require("@db/section/model");
require("@db/semester/model");
require("@db/labBatch/model");
require("@db/studentTimeTable/model");

const studentAttendanceSchema = new mongoose.Schema({
  attendanceType: {
    type: String,
    enum: ["theory", "lab", "project", "practical", "other"],
    required: true,
  },
  labBatch: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "LabBatch",
    required: function () {
      return this.attendanceType === "lab" ? true : false;
    },
  },
  school: {
    type: mongoose.Types.ObjectId,
    ref: "School",
    required: true,
  },
  degreeCode: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "DegreeCode",
    required: true,
  },
  year: {
    type: Number,
    required: true,
  },
  semester: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Semester",
    required: [true, "Provide semester"],
  },
  section: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Section",
    required: [true, "Provide section"],
  },
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Student",
    required: [true, "Provide student"],
  },
  subject: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Subject",
    required: true,
  },
  date: {
    type: Date,
    required: [true, "Provide date"],
  },
  attendanceStatus: {
    type: String,
    enum: ["present", "absent", "half-day", "on-duty", "not-taken", null],
    default: null,
  },
  faculty: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Employee",
    required: true,
  },
  timeTableId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "StudentTimeTable",
    required: true,
  },
  attendanceFreezed: {
    type: Boolean,
    default: false,
  },
});

const StudentAttendance = db.model(
  "StudentAttendance",
  studentAttendanceSchema
);

module.exports = StudentAttendance;
