const mongoose = require("mongoose");

require("@db/subject/model");
require("@db/section/model");
require("@db/semester/model");
require("@db/employee/model");
require("@db/slot/model");
require("@db/buildingRoom/model");
require("@db/building/model");

const courseMaterialSchema = new mongoose.Schema({
  title: {
    type: String,
    default: "",
  },
  file: {
    type: String,
    default: "",
  },
  link: {
    type: String,
    default: "",
  },
});

const coursePlanSchema = new mongoose.Schema({
  year: {
    type: Number,
    required: true,
  },
  courseType: {
    type: String,
    enum: ["theory", "lab", "project", "practical", "other"],
    required: true,
  },
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
  courseMaterials: [courseMaterialSchema],
});

module.exports = db.model("CoursePlan", coursePlanSchema);
