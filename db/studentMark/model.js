const mongoose = require("mongoose");

require("@db/school/model");
require("@db/examSchedule/model");
require("@db/examGrade/model");
require("@db/student/model");
require("@db/examTerm/model");
require("@db/class/model");
require("@db/section/model");
require("@db/subject/model");

const studentMarkSchema = new mongoose.Schema({
  school: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "School",
    required: true,
  },
  examSchedule: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "ExamSchedule",
    immutable: true,
  },
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Student",
    default: null,
  },
  obtainedWrittenMarks: {
    type: Number,
    default: 0,
  },
  obtainedPraticalMarks: {
    type: Number,
    default: 0,
  },
  grade: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "ExamGrade",
    default: null,
  },
  comment: {
    type: String,
    default: "",
  },
  //   attendanceStatus: {
  //     type: String,
  //     enum: {
  //       values: ["A", "P"],
  //       message: "Please select a valid attendance status",
  //     },
  //     default: "P",
  //   },
});

const StudentMark = db.model("StudentMark", studentMarkSchema);

module.exports = StudentMark;
