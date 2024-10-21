const mongoose = require("mongoose");

require("@db/employee/model");
require("@db/courseOutcome/model");
require("@db/semester/model");
require("@db/subject/model");
require("@db/section/model");
require("@db/student/model");

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
  questionnaireIndex: {
    type: Number,
    required: true,
  },
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
  section: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Section",
    required: true,
  },
  questions: [questionsSchema],
  active: {
    type: Boolean,
    default: false,
  },
  totalSubmissionNeeded: {
    type: Number,
    required: true,
  },
  submittedBy: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Student",
    },
  ],
  attainmentScore: {
    type: Object,
  },
});

module.exports = db.model("Questionnaire", questionnaireSchema);
