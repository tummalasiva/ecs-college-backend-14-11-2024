const mongoose = require("mongoose");

require("@db/courseOutcome/model");
require("@db/programOutcome/model");
require("@db/examTitle/model");
require("@db/degreeCode/model");
require("@db/subject/model");
require("@db/pso/model");

const questionSchema = new mongoose.Schema({
  questionNumber: {
    type: String,
    required: true,
  },
  maximumMarks: {
    type: Number,
    required: true,
  },
  co: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "CourseOutcome",
    },
  ],
  po: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "ProgramOutcome",
    },
  ],
  pso: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Pso",
    },
  ],
  bl: {
    type: Number,
    required: true,
  },
  minimumMarksForCoAttainment: {
    type: Number,
    required: true,
  },
});

const cieExamSchema = new mongoose.Schema({
  examTitle: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "ExamTitle",
    required: true,
  },
  subject: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Subject",
    required: true,
  },
  degreeCode: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "DegreeCode",
    required: true,
  },
  semester: {
    type: String,
    required: true,
  },
  questions: [questionSchema],
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Employee",
    required: true,
  },
});

module.exports = db.model("CieExam", cieExamSchema);
