const mongoose = require("mongoose");

require("@db/school/model");
require("@db/academicYear/model");

const examTermSchema = new mongoose.Schema({
  school: {
    type: mongoose.Types.ObjectId,
    ref: "School",
    required: true,
  },
  title: {
    type: String,
    required: [true, "Provide exam title"],
  },
  examType: {
    type: String,
    enum: ["general", "competitive"],
    required: [true, "Provide exam type"],
  },
  note: {
    type: String,
    default: "",
  },
  marksAssignmentAllowed: {
    type: Boolean,
    default: false,
    required: [true, "Mention if marks assignment is allowed"],
  },
  academicYear: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "AcademicYear",
    required: [true, "Provide academic year id"],
  },
  isPublic: {
    type: Boolean,
    default: false,
  },
});

const ExamTerm = db.model("ExamTerm", examTermSchema);

module.exports = ExamTerm;
