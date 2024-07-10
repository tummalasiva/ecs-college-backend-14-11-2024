const mongoose = require("mongoose");

require("@db/school/model");
require("@db/class/model");
require("@db/academicYear/model");

const instructionSchema = new mongoose.Schema({
  point: String,
});

const optionSchema = new mongoose.Schema({
  value: String,
});

const quizSchema = new mongoose.Schema({
  question: {
    type: String,
    required: true,
  },
  options: [optionSchema],
  correctOption: {
    type: String,
  },
});

const preAddmissionExamSchema = new mongoose.Schema({
  school: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: "School",
  },
  class: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: "Class",
  },
  academicYear: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: "AcademicYear",
  },
  examName: {
    type: String,
    required: true,
  },
  passingMarks: {
    type: Number,
    required: true,
  },
  totalMarks: {
    type: Number,
    required: true,
  },
  quiz: [quizSchema],

  negativeMarking: {
    type: Boolean,
    default: false,
  },
  negativeMarkingPerQuestion: {
    type: Number,
    required: function () {
      return this.negativeMarking ? true : false;
    },
  },
  marksPerQuestion: {
    type: Number,
    required: true,
  },
  additionalInstructions: [instructionSchema],
});

const PreAdmissionExam = db.model("PreAdmissionExam", preAddmissionExamSchema);
module.exports = PreAdmissionExam;
