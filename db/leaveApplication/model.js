const mongoose = require("mongoose");

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
  school: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "School",
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
  applierRole: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Role",
    required: [true, "Please provide applier role"],
  },
  applierRoleName: {
    type: String,
    required: [true, "Please provide applier role name"],
  },
  applier: {
    type: mongoose.Schema.Types.ObjectId,
    ref: function () {
      return this.applierRoleName?.toLowerCase() !== "student"
        ? "Employee"
        : "Student";
    },
  },
  approvedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Employee",
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
  file: {
    type: String,
    default: null,
  },
  description: {
    type: String,
    default: "",
  },
});

const LeaveApplication = db.model("LeaveApplication", leaveApplicationSchema);

module.exports = LeaveApplication;
