const mongoose = require("mongoose");

require("@db/examTitle/model");
require("@db/subject/model");
require("@db/employee/model");
require("@db/semester/model");
require("@db/section/model");

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
  count: {
    typeof: Number,
    required: true,
  },
  bestOf: {
    type: Number,
    required: true,
  },
});

const assessmentPlanSchema = new mongoose.Schema({
  plan: [assessmentExamSchema],

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
  year: {
    type: Number,
    required: true,
  },
  courseType: {
    type: String,
    enum: ["theory", "lab", "project", "practical", "other"],
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
