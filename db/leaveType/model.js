const mongoose = require("mongoose");

require("@db/department/model");

const leaveTypeNames = [
  "Sick Leave",
  "Casual Leave",
  "Annual Leave",
  "Maternity Leave",
  "Paternity Leave",
  "Bereavement Leave",
  "Study Leave",
  "Unpaid Leave",
  "Compensatory Off",
  "Marriage Leave",
  "Childcare Leave",
  "Examination Leave",
];

const leaveTypeSchema = new mongoose.Schema({
  name: {
    type: String,
    maxLength: 60,
    required: true,
    trim: true,
  },
  numberOfLeaves: {
    type: Number,
    required: function () {
      return this.leaveTypeFor === "Student" ? false : true;
    },
  },
  departments: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Department",
      required: function () {
        return this.leaveTypeFor === "Student" ? false : true;
      },
    },
  ],
  needsGuardianApproval: {
    type: Boolean,
    required: function () {
      return this.leaveTypeFor === "Student" ? false : true;
    },
  },
  leaveTypeFor: {
    type: String,
    enum: {
      values: ["Student", "Employee"],
      message: "Please select a valid leave type for.",
    },
    required: true,
  },
  isAutoEarned: {
    type: Boolean,
    default: false,
    required: function () {
      return this.leaveTypeFor === "Student" ? false : true;
    },
  },
  canCarryForward: {
    type: Boolean,
    default: false,
    required: function () {
      return this.leaveTypeFor === "Student" ? false : true;
    },
  },
  carryForwardCount: {
    type: Number,
    default: 0,
    required: function () {
      return this.leaveTypeFor === "Student" ? false : true;
    },
  },
  isSpecial: {
    type: Boolean,
    default: false,
    required: function () {
      return this.leaveTypeFor === "Student" ? false : true;
    },
  },
});

const LeaveType = db.model("LeaveType", leaveTypeSchema);

module.exports = LeaveType;
