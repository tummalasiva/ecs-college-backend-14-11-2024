const mongoose = require("mongoose");

require("@db/class/model");
require("@db/subject/model");
require("@db/school/model");
require("@db/student/model");
require("@db/employee/model");
require("@db/academicYear/model");
require("@db/session/model");

const studentAttendanceSchema = new mongoose.Schema({
  school: {
    type: mongoose.Types.ObjectId,
    ref: "School",
    required: true,
  },
  academicYear: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "AcademicYear",
    required: true,
  },
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Student",
    required: [true, "Provide student"],
  },
  attendanceType: {
    type: String,
    enum: ["subjectWise", "sessionWise", "classWise"],
  },
  subject: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Subject",
    required: function () {
      return this.attendanceType === "subjectWise"
        ? [true, "Provide subject"]
        : false;
    },
  },
  class: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Class",
    required: function () {
      return this.attendanceType === "classWise"
        ? [true, "Provide class"]
        : false;
    },
  },
  sessions: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "SchoolSession",
      required: function () {
        return this.attendanceType === "sessionWise"
          ? [true, "Provide session"]
          : false;
      },
    },
  ],
  date: {
    type: Date,
    required: [true, "Provide date"],
  },
  attendanceStatus: {
    type: String,
    enum: ["present", "absent", "half-day", "holiday", "not-taken"],
    default: "Not-Taken",
  },
  takenBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Employee",
    required: [true, "Provide employee"],
  },
  updatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Employee",
    required: [true, "Provide employee"],
  },
});

const StudentAttendance = db.model(
  "StudentAttendance",
  studentAttendanceSchema
);

module.exports = StudentAttendance;
