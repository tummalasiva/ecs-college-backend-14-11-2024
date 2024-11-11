const mongoose = require("mongoose");

require("@db/student/model");
require("@db/subject/model");
require("@db/employee/model");
require("@db/examTitle/model");
require("@db/courseOutcome/model");
require("@db/semester/model");
require("@db/section/model");
require("@db/courseOutcome/model");

const questionSchema = new mongoose.Schema({
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
  answer: {
    type: String,
    required: true,
  },
  maximumMarks: {
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
    default: 0, // This will be calculated dynamically
  },
});
const internalExamSchema = new mongoose.Schema({
  examIndex: {
    type: Number,
    required: true,
  },
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
  examTitle: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "ExamTitle",
    required: true,
  },
  passingMarks: {
    type: Number,
    required: true,
  },
  maximumMarks: {
    type: Number,
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
  students: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Student",
    },
  ],
  enableAnswerUpload: {
    type: Boolean,
    default: false,
    required: true,
  },
  duration: {
    type: Number,
    required: true,
  },
  submissions: [
    {
      student: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Student",
        required: true,
      },
      answers: [
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
        },
      ],
    },
  ],
});

internalExamSchema.pre("save", function (next) {
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

module.exports = db.model("InternalExam", internalExamSchema);
