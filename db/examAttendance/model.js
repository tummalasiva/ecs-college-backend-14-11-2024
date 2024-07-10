const mongoose = require("mongoose");

const examAttendanceSchema = new mongoose.Schema({
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
    required: [true, "Provide subject id"],
  },
  studentsAttendence: [
    {
      student: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Student",
      },
      examAttended: {
        type: Boolean,
        default: false,
      },
    },
  ],
});

module.exports = db.model("ExamAttendance", examAttendanceSchema);
