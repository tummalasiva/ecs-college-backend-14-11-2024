const mongoose = require("mongoose");

require("@db/school/model");
require("@db/class/model");
require("@db/section/model");
require("@db/examTerm/model");
require("@db/student/model");
require("@db/employee/model");
require("@db/subject/model");
require("@db/academicYear/model");

const examAttendanceSchema = new mongoose.Schema({
  academicYear: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "AcademicYear",
    required: true,
  },
  school: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "School",
    required: true,
  },
  class: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Class",
    required: [true, "Provide class id"],
  },
  section: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Section",
    required: [true, "Provide section id"],
  },
  examTerm: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "ExamTerm",
    required: [true, "Provide examTerm id"],
  },
  subject: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Subject",
    required: true,
  },
  studentsAttendence: [
    {
      student: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Student",
        required: true,
      },
      attendanceStatus: {
        type: String,
        enum: ["present", "absent", "half-day", "holiday", "not-taken"],
        default: "not-taken",
      },
    },
  ],

  takenBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Employee",
    required: true,
  },
});

module.exports = db.model("ExamAttendance", examAttendanceSchema);
