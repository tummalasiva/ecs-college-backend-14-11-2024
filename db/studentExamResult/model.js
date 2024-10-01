const mongoose = require("mongoose");

require("@db/academicYear/model");
require("@db/degreeCode/model");
require("@db/student/model");
require("@db/subject/model");
require("@db/examTitle/model");

const studentExamResultSchema = new mongoose.Schema({
  academicYear: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "AcademicYear",
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
  subject: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Subject",
    required: true,
  },
  registrationNumber: {
    type: String,
    required: true,
  },
  examTitle: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "ExamTtile",
    required: true,
  },
  maximumMarks: {
    type: Number,
    required: true,
  },
  marksObtained: {
    type: Number,
    required: true,
  },
  answeredQuestions: {
    type: Array,
  },
  grade: {
    type: String,
    required: true,
  },
});

module.exports = db.model("StudentExamResult", studentExamResultSchema);
