const mongoose = require("mongoose");

require("@db/school/model");
require("@db/employee/model");
require("@db/subject/model");
require("@db/class/model");
require("@db/section/model");

const routineSchema = new mongoose.Schema({
  school: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "School",
    required: true,
  },
  class: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Class",
    required: true,
  },
  section: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Section",
    required: true,
  },
  day: {
    type: String,
    enum: [
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday",
      "Sunday",
    ],
    required: true,
  },
  subject: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Subject",
    required: true,
  },
  teacher: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Employee",
    required: true,
  },
  roomNumber: {
    type: String,
    default: "",
  },
  startTime: {
    type: String,
    required: true,
  },
  endTime: {
    type: String,
    required: true,
  },
});

const Routine = db.model("Routine", routineSchema);

module.exports = Routine;
