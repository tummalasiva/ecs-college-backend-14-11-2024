const mongoose = require("mongoose");

require("@db/subject/model");
require("@db/section/model");
require("@db/semester/model");
require("@db/employee/model");
require("@db/slot/model");
require("@db/buildingRoom/model");
require("@db/building/model");

const coursePlanSchema = new mongoose.Schema({
  subject: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Subject",
    required: true,
  },
  section: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Section",
    required: true,
  },
  planDescription: {
    type: String,
    default: "",
  },
  plannedDate: {
    type: Date,
    required: true,
  },
  executedDate: {
    type: Date,
  },
  updateDescription: {
    type: String,
    default: null,
  },
  facultyAssigned: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Employee",
    required: true,
  },
  substituteEmployee: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Employee",
  },
  substituteReason: {
    type: String,
    default: null,
  },
  semester: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Semester",
    required: true,
  },
  slots: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Slot",
      required: true,
    },
  ],
  day: {
    type: String,
    required: true,
  },
  room: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "BuildingRoom",
    required: true,
  },
  building: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Building",
    required: true,
  },
});

module.exports = db.model("CoursePlan", coursePlanSchema);
