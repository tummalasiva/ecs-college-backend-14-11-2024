const mongoose = require("mongoose");

require("@db/examTitle/model");
require("@db/subject/model");
require("@db/employee/model");
require("@db/semester/model");

const assessmentExamSchema = new mongoose.Schema({
  examTitle: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "ExamTitle",
    required: true,
  },
  maximumMarks: {
    type: Number,
    required: true,
  },
  weightage: {
    type: Number,
    required: true,
  },
});

const assessmentPlanSchema = new mongoose.Schema({
  exams: [assessmentExamSchema],
  subject: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Subject",
    required: true,
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Employee",
    required: true,
  },
  semester: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Semester",
    required: true,
  },
});

module.exports = db.model("AssessmentPlan", assessmentPlanSchema);
