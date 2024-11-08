const mongoose = require("mongoose");

require("@db/employee/model");
require("@db/subject/model");
require("@db/courseOutcome/model");

const myQuestionBankSchema = new mongoose.Schema({
  subject: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Subject",
    required: true,
  },
  question: {
    type: String,
    required: true,
    maxLength: 1000,
  },
  isMcq: {
    type: Boolean,
    required: true,
  },
  images: [
    {
      type: String,
    },
  ],
  options: [String],
  answer: {
    type: String,
    required: true,
  },
  maximumMarks: {
    type: Number,
    required: true,
  },
  cos: {
    type: [mongoose.Schema.Types.ObjectId],
    ref: "CourseOutcome",
  },
  bl: {
    type: Number,
    required: true,
  },
  minimumMarksForCoAttainment: {
    type: Number,
    required: true,
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Employee",
    required: true,
  },
});

module.exports = db.model("MyQuestionBank", myQuestionBankSchema);
