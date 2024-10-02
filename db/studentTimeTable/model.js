const mongoose = require("mongoose");

require("@db/building/model");
require("@db/buildingRoom/model");
require("@db/academicYear/model");
require("@db/slot/model");
require("@db/degreeCode/model");
require("@db/subject/model");
require("@db/labBatch/model");
require("@db/employee/model");
require("@db/subjectComponent/model");

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
  academicYear: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "AcademicYear",
    required: true,
  },
  slots: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Slot",
      required: true,
    },
  ],
  semester: {
    type: String,
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
  faculty: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Employee",
  },
  academicSemester: {
    type: String,
    required: true,
  },
});

module.exports = db.model("StudentTimeTable", studentTimeTableSchema);
