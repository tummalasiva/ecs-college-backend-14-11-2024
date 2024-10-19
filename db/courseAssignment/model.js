const mongoose = require("mongoose");

require("@db/student/model");
require("@db/employee/model");
require("@db/section/model");
require("@db/subject/model");
require("@db/semester/model");

const submissionSchema = new mongoose.Schema({
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Student",
    required: true,
  },
  file: {
    type: String,
  },
  text: {
    type: String,
    required: true,
  },
  submittedAt: {
    type: Date,
    required: true,
    default: Date.now,
  },
});

const courseAssignmentSchema = new mongoose.Schema({
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Employee",
    required: true,
  },
  courseType: {
    type: String,
    enum: ["theory", "lab", "project", "practical", "other"],
    required: true,
  },
  students: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Student",
      required: true,
    },
  ],
  submissionType: {
    type: String,
    enum: ["file", "text"],
    required: true,
  },
  section: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Section",
    required: true,
  },
  subject: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Subject",
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
  assignmentDescription: {
    type: String,
    required: true,
  },
  submissions: [submissionSchema],
  enableSubmission: {
    type: Boolean,
    required: true,
    default: false,
  },
  deadline: {
    type: Date,
    required: true,
  },
});

module.exports = db.model("CourseAssignment", courseAssignmentSchema);
