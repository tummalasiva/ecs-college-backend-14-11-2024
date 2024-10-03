const mongoose = require("mongoose");

require("@db/courseOutcome/model");
require("@db/examTitle/model");
require("@db/degreeCode/model");
require("@db/subject/model");
require("@db/semester/model");

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
  bl: {
    type: Number,
    required: true,
  },
  minimumMarksForCoAttainment: {
    type: Number,
    required: true,
  },
  weightage: {
    type: Number,
    default: 0, // This will be calculated dynamically
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
    type: mongoose.Schema.Types.ObjectId,
    ref: "Semester",
    required: true,
  },
  year: {
    type: Number,
    required: true,
  },
  questions: [questionSchema],
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Employee",
    required: true,
  },
});

cieExamSchema.pre("save", function (next) {
  const exam = this;

  // Calculate total marks for the exam
  const totalMarks = exam.questions.reduce(
    (sum, question) => sum + question.maximumMarks,
    0
  );

  // Calculate weightage for each question
  exam.questions.forEach((question) => {
    question.weightage = (question.maximumMarks / totalMarks) * 100;
  });

  next();
});

module.exports = db.model("CieExam", cieExamSchema);
