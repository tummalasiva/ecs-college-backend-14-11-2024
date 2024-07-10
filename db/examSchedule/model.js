const mongoose = require("mongoose");

require("@db/school/model");
require("@db/examTerm/model");
require("@db/class/model");
require("@db/subject/model");

const examScheduleSchema = new mongoose.Schema({
  school: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "School",
    required: true,
  },
  examTerm: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "ExamTerm",
    required: [true, "Provide exam term id"],
  },
  class: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Class",
    required: [true, "Provide class id"],
  },
  subject: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Subject",
    required: [true, "provide subject id"],
  },
  examDate: {
    type: String,
    required: [true, "Provide exam date"],
  },
  startTime: {
    type: String,
    required: [true, "Provide start time"],
  },
  endTime: {
    type: String,
    required: [true, "Provide end time"],
  },
  marksFreezDate: {
    type: String,
    required: [true, "Please provide marks freeze date."],
  },
  maximumMarks: {
    type: Number,
    required: [true, "Provide max marks"],
  },
  pratical: {
    type: String,
    default: "",
  },
  minimumMarks: {
    type: Number,
    required: [true, "Provide minimum marks"],
  },
  praticalMarks: {
    type: String,
    enum: ["inactive", "active"],
  },
  showInHallTick: {
    type: Boolean,
    default: true,
  },
  showInExamResults: {
    type: Boolean,
    default: true,
  },
  orderSequence: {
    type: Number,
    default: Number.POSITIVE_INFINITY,
    required: [true, "Please provide order sequence"],
  },
});

const ExamSchedule = db.model("ExamSchedule", examScheduleSchema);

module.exports = ExamSchedule;
