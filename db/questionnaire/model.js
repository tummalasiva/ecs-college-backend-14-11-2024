const mongoose = require("mongoose");

require("@db/employee/model");
require("@db/degreeCode/model");
require("@db/courseOutcome/model");
require("@db/semester/model");
require("@db/academicYear/model");
require("@db/subject/model");
require("@db/section/model");

const questionsSchema = new mongoose.Schema({
  text: {
    type: String,
    required: true,
  },
  co: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "CourseOutcome",
      required: true,
    },
  ],
  coAttainmentThreshold: {
    type: Number,
    required: true,
  },
});

const questionnaireSchema = new mongoose.Schema({
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Employee",
    required: true,
  },
  subject: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Subject",
    required: true,
  },
  year: {
    type: Number,
    required: true,
  },
  semester: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Semester",
    required: true,
  },
  degreeCode: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "DegreeCode",
    required: true,
  },
  section: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Section",
    required: true,
  },
  questions: [questionsSchema],
  academicYear: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "AcademicYear",
    required: true,
  },
  active: {
    type: Boolean,
    default: false,
  },
  totalSubmissionNeeded: {
    type: Number,
    required: true,
  },
  totalSubmitted: {
    type: Number,
    default: 0,
  },
  attainmentScore: {
    type: Object,
  },
});

module.exports = db.model("Questionnaire", questionnaireSchema);
