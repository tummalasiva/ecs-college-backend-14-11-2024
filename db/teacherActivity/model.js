const mongoose = require("mongoose");

require("@db/employee/model");
require("@db/student/model");
require("@db/class/model");
require("@db/section/model");
require("@db/subject/model");
require("@db/academicYear/model");

const feedbackSchema = new mongoose.Schema({
  givenBy: {
    type: mongoose.Types.ObjectId,
    ref: "Student",
    required: true,
  },
  fallbackGivenBy: {
    type: Object,
    required: true,
  },
  feedback: {
    type: String,
    trim: true,
    maxLength: 1000,
    required: true,
  },
});

const teacherAtivitySchema = new mongoose.Schema({
  school: {
    type: mongoose.Types.ObjectId,
    ref: "School",
    required: true,
  },
  createdBy: {
    type: mongoose.Types.ObjectId,
    ref: "Employee",
    required: true,
    index: true,
  },
  fallbackCreatedBy: {
    type: Object,
    required: true,
  },
  topic: {
    type: String,
    maxLength: 2000,
    required: true,
    trim: true,
  },
  class: {
    type: mongoose.Types.ObjectId,
    ref: "Class",
    required: true,
    index: true,
  },
  fallbackClass: {
    type: Object,
    required: true,
  },
  section: {
    type: mongoose.Types.ObjectId,
    ref: "Section",
    required: true,
    index: true,
  },
  fallbackSection: {
    type: Object,
    required: true,
  },
  subject: {
    type: mongoose.Types.ObjectId,
    ref: "Subject",
    required: true,
  },
  fallbackSubject: {
    type: Object,
    required: true,
  },
  academicYear: {
    type: mongoose.Types.ObjectId,
    ref: "AcademicYear",
    required: true,
  },
  feedbacks: {
    type: [feedbackSchema],
    default: [],
  },
  deleted: {
    type: Boolean,
    default: false,
  },
});

teacherAtivitySchema.indexes(["createdBy", "createdAt", "class", "section"]);

const TeacherActivity = db.model("TeacherActivity", teacherAtivitySchema);

module.exports = TeacherActivity;
