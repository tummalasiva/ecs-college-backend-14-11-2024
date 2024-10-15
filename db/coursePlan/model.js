const mongoose = require("mongoose");

require("@db/subject/model");
require("@db/section/model");
require("@db/semester/model");
require("@db/employee/model");
require("@db/slot/model");

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
});

module.exports = db.model("CoursePlan", coursePlanSchema);
