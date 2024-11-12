const mongoose = require("mongoose");

require("@db/academicYear/model");
require("@db/degreeCode/model");
require("@db/student/model");
require("@db/subject/model");
require("@db/examTitle/model");
require("@db/section/model");
require("@db/semester/model");
require("@db/cieExam/model");
require("@db/internalExam/model");

const studentExamResultSchema = new mongoose.Schema({
  exam: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "InternalExam",
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
      question: {
        type: String,
        required: true,
      },
      isMcq: {
        type: Boolean,
        required: true,
      },
      questionNumber: {
        type: String,
        required: true,
      },
      images: [String],
      options: [String],
      uploadedAnsweFile: {
        type: String,
        default: null,
      },
      providedAnswer: {
        type: String,
        required: true,
      },
      correctAnswer: {
        type: String,
        required: true,
      },
      maximumMarks: {
        type: Number,
        required: true,
      },
      obtainedMarks: {
        type: Number,
        required: true,
      },
      cos: [
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
        default: 0,
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
