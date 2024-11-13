const mongoose = require("mongoose");

require("@db/examTitle/model");
require("@db/subject/model");
require("@db/employee/model");

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
    type: Number,
    required: true,
  },
  bestOf: {
    type: Number,
    required: true,
  },
  conductedBy: {
    type: [String],
    enum: ["faculty", "coe", "exam_coordinator", "hod"],
    required: true,
  },
  multipleQuestionsCanBeSet: {
    type: Boolean,
    required: true,
  },
  marksUpdatedBy: {
    type: String,
    enum: ["incharge", "lab_faculty", "others"],
    required: true,
    default: "incharge",
  },
});

const assessmentPlanSchema = new mongoose.Schema({
  plan: [assessmentExamSchema],
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
  updatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Employee",
    default: function () {
      return this.createdBy;
    },
  },
});

module.exports = db.model("AssessmentPlan", assessmentPlanSchema);
