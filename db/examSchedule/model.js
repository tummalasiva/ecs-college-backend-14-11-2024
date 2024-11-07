const mongoose = require("mongoose");

require("@db/slot/model");
require("@db/student/model");
require("@db/employee/model");
require("@db/cieExam/model");

const examScheduleSchema = new mongoose.Schema({
  cieExam: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "CieExam",
    required: true,
  },
  date: {
    type: Date,
    required: true,
  },
  slot: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Slot",
    required: true,
  },
  students: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Student",
    },
  ],
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Employee",
    required: true,
    select: false,
  },
});

module.exports = db.model("ExamSchedule", examScheduleSchema);
