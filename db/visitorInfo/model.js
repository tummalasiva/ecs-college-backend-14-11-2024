const mongoose = require("mongoose");

require("@db/school/model");
require("@db/class/model");
require("@db/section/model");
require("@db/student/model");
require("@db/employee/model");

const visitorInfo = new mongoose.Schema({
  school: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "School",
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
  phone: {
    type: Number,
    required: true,
  },
  comingForm: {
    type: String,
    required: true,
  },
  roleName: {
    type: String,
    required: true,
  },
  toMeetUserType: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Role",
    required: true,
  },
  toMeetUser: {
    type: mongoose.Schema.Types.ObjectId,
    ref: function () {
      return this.roleName === "STUDENT" ? "Student" : "Employee";
    },
    required: true,
  },
  class: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Class",
  },
  section: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Section",
  },
  reasonToMeet: {
    type: String,
    default: "",
  },
  checkIn: {
    type: Date,
    default: Date.now,
  },
  checkOut: {
    type: Date,
    default: null,
  },
  note: {
    type: String,
    default: null,
  },
  enteredBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Employee",
    required: true,
  },
});

const VisitorInfo = db.model("VisitorInfo", visitorInfo);

module.exports = VisitorInfo;
