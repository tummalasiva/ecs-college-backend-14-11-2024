const mongoose = require("mongoose");

require("@db/degreeCode/model");
require("@db/subject/model");

const SEMESTER_OPTIONS = [
  "First Academic Semester",
  "Second Academic Semester",
];

const semesterSubjectMapping = new mongoose.Schema({
  year: {
    type: Number,
    required: true,
  },
  semester: {
    type: String,
    enum: {
      values: SEMESTER_OPTIONS,
      message: "{VALUE} is not a valid semester.",
    },
    required: true,
  },
  degreeCode: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "DegreeCode",
    required: true,
  },
  subjects: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Subject",
    },
  ],
  allocationProcessed: {
    type: Boolean,
    default: false,
  },
});

module.exports = db.model("SemesterSubjectMapping", semesterSubjectMapping);
