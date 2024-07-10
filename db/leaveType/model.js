const mongoose = require("mongoose");

require("@db/school/model");
require("@db/department/model");

const leaveTypeSchema = new mongoose.Schema({
  school: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "School",
    required: true,
  },
  name: {
    type: String,
    maxLength: 60,
    required: true,
    trim: true,
  },
  total: {
    type: Number,
    required: function () {
      return this.leaveTypeFor === "Student" ? false : true;
    },
  },
  departments: [
    {
      type: mongoose.Types.ObjectId,
      ref: "Department",
      required: function () {
        return this.leaveTypeFor === "Student" ? false : true;
      },
    },
  ],
  leaveTypeFor: {
    type: String,
    enum: {
      values: ["Student", "Employee"],
      message: "Please select a valid leave type for.",
    },
    required: true,
  },
  autoEarned: {
    type: Boolean,
    default: false,
    required: function () {
      return this.leaveTypeFor === "Student" ? false : true;
    },
  },
  autoEarnCount: {
    type: Number,
    default: 0,
    required: function () {
      return this.leaveTypeFor === "Student" ? false : true;
    },
  },
  canResetCarryForward: {
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
