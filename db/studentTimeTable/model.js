const mongoose = require("mongoose");

require("@db/building/model");
require("@db/buildingRoom/model");
require("@db/slot/model");
require("@db/degreeCode/model");
require("@db/subject/model");
require("@db/labBatch/model");
require("@db/employee/model");
require("@db/subjectComponent/model");
require("@db/semester/model");
require("@db/section/model");

const studentTimeTableSchema = new mongoose.Schema({
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

  slots: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Slot",
      required: true,
    },
  ],
  year: {
    type: Number,
    required: true,
  },
  degreeCode: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "DegreeCode",
    required: true,
  },
  subject: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Subject",
  },
  batches: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "LabBatch",
    },
  ],
  day: {
    type: String,
    required: true,
  },
  title: {
    type: String,
    default: "",
  },
  semester: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: "Semester",
  },
  section: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Section",
    required: true,
  },
});

module.exports = db.model("StudentTimeTable", studentTimeTableSchema);
