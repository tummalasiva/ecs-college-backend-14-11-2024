const mongoose = require("mongoose");

require("@db/building/model");
require("@db/buildingRoom/model");
require("@db/examSchedule/model");
require("@db/academicYear/model");
require("@db/student/model");

const seatingArrangementSchema = new mongoose.Schema({
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
  seat: {
    type: String,
    required: true,
  },
  examSchedule: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "ExamSchedule",
    required: true,
  },
  academicYear: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "AcademicYear",
    required: true,
  },
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Student",
    required: true,
  },
});

module.exports = db.model("SeatingArrangement", seatingArrangementSchema);
