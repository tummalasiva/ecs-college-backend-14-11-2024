const mongoose = require("mongoose");

require("@db/school/model");

const examGradeSchema = new mongoose.Schema({
  school: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "School",
    required: true,
  },
  grade: {
    type: String,
    required: [true, "Provide Grade"],
  },
  group: {
    type: String,
    enum: ["scholastic", "co-scholastic"],
    required: [true, "Provide Group"],
  },
  gradePoint: {
    type: Number,
    required: [true, "Provide Grade Point"],
  },
  markFrom: {
    type: Number,
    required: [true, "Provide Mark From"],
  },
  markTo: {
    type: Number,
    required: [true, "Provide Mark To"],
  },
  note: {
    type: String,
    default: null,
  },
});

const ExamGrade = db.model("ExamGrade", examGradeSchema);

module.exports = ExamGrade;
