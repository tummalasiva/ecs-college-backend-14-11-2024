const mongoose = require("mongoose");

require("@db/semester/model");
require("@db/academicYear/model");
require("@db/employee/model");
require("@db/student/model");
require("@db/school/model");
require("@db/leaveType/model");
require("@db/role/model");

const leaveApplicationSchema = new mongoose.Schema({
  academicYear: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "AcademicYear",
    required: true,
  },
  semester: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Semester",
    required: true,
  },
  startDate: {
    type: Date,
    required: [true, "Please provide leave start date"],
  },
  endDate: {
    type: Date,
    required: [true, "Please provide leave end date"],
  },
  subject: {
    type: String,
    required: [true, "Please provide subject"],
  },
  totalDays: {
    type: Number,
    required: [true, "Please provide total days"],
  },
  appliedByType: {
    type: String,
    enum: ["student", "employee"],
    required: [true, "Please provide leave application type"],
  },
  appliedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: function () {
      return this.appliedByType?.toLowerCase() !== "student"
        ? "Employee"
        : "Student";
    },
  },
  approvedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Employee",
  },
  approvedByGuardian: {
    type: Boolean,
    default: false,
  },
  leaveType: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "LeaveType",
    required: [true, "Please provide leave type"],
  },
  leaveStatus: {
    type: String,
    enum: ["pending", "approved", "rejected"],
    default: "pending",
  },
  files: [
    {
      type: String,
      default: null,
    },
  ],
  description: {
    type: String,
    default: "",
  },
});

const LeaveApplication = db.model("LeaveApplication", leaveApplicationSchema);

module.exports = LeaveApplication;
