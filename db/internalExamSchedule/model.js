const mongoose = require("mongoose");

require("@db/slot/model");
require("@db/internalExam/model");
require("@db/semester/model");
require("@db/employee/model");
require("@db/building/model");
require("@db/buildingRoom/model");

const internalExamSchedule = new mongoose.Schema({
  date: {
    type: Date,
    required: true,
  },
  slot: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Slot",
    required: true,
  },
  exam: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "InternalExam",
    required: true,
  },
  semester: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Semester",
    required: true,
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Employee",
    required: true,
  },
  building: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Building",
    required: true,
  },
  room: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "BuildingRoom",
    required: true,
  },
  enabled: {
    type: Boolean,
    required: true,
    default: false,
  },
});

module.exports = db.model("InternalExamSchedule", internalExamSchedule);
