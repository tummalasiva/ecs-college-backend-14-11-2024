const mongoose = require("mongoose");

require("@db/subject/model");
require("@db/school/model");
require("@db/student/model");
require("@db/employee/model");
require("@db/academicYear/model");
require("@db/degreeCode/model");
require("@db/section/model");

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
  degreeCode: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "DegreeCode",
    required: true,
  },
  semester: {
    type: Number,
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
    required: function () {
      return this.attendanceType === "subjectWise"
        ? [true, "Provide subject"]
        : false;
    },
  },
  date: {
    type: Date,
    required: [true, "Provide date"],
  },
  attendanceStatus: {
    type: String,
    enum: ["present", "absent", "half-day", "holiday", "not-taken"],
    default: "not-taken",
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
