const mongoose = require("mongoose");

require("@db/school/model");
require("@db/employee/model");
require("@db/academicYear/model");

const employeeAttendanceSchema = new mongoose.Schema({
  academicYear: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "AcademicYear",
    required: true,
  },
  school: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "School",
    required: true,
  },
  date: {
    type: Date,
    required: true,
  },
  employee: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Employee",
    required: true,
  },
  attendanceStatus: {
    type: String,
    enum: ["present", "absent", "late"],
    message:
      '{VALUE} not valid, provide values between "present","absent","late"',
    default: "present",
  },
});

const EmployeeAttendance = db.model(
  "EmployeeAttendance",
  employeeAttendanceSchema
);

module.exports = EmployeeAttendance;
