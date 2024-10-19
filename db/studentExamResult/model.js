const mongoose = require("mongoose");

require("@db/academicYear/model");
require("@db/degreeCode/model");
require("@db/student/model");
require("@db/subject/model");
require("@db/examTitle/model");
require("@db/section/model");
require("@db/semester/model");
require("@db/cieExam/model");

const studentExamResultSchema = new mongoose.Schema({
  cieExam: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "CieExam",
    required: true,
  },
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
    ref: "ExamTitle",
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
  answeredQuestions: [
    {
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
      obtainedMarks: {
        type: Number,
        default: null,
      },
      coAttained: {
        type: Boolean,
        default: false,
      },
    },
  ],
  grade: {
    type: String,
    required: true,
  },
});

module.exports = db.model("StudentExamResult", studentExamResultSchema);
