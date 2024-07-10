const mongoose = require("mongoose");

function generateExamScheduleId() {
  const randomDecimal = Math.random();
  const random5DigitNumber = Math.floor(randomDecimal * 90000) + 10000;
  return random5DigitNumber;
}

require("@db/school/model");
require("@db/class/model");
require("@db/academicYear/model");
require("@db/preadmission/exam/model");

const preAddmissionExamScheduleSchema = new mongoose.Schema({
  school: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "School",
    required: true,
  },
  class: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Class",
    required: true,
  },
  notified: {
    type: Boolean,
    default: false,
  },
  academicYear: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "AcademicYear",
    required: true,
  },
  scheduleId: {
    type: Number,
    default: function () {
      return generateExamScheduleId();
    },
  },
  exam: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "PreAdmissionExam",
    required: true,
  },
  examLink: {
    type: String,
    required: true,
  },
  venueLink: {
    type: String,
    required: true,
  },
  venue: {
    address: {
      type: String,
      required: true,
    },
    roomNumber: {
      type: Number,
    },
  },
  dateOfExam: {
    type: Date,
    required: true,
  },
  startTime: {
    type: String,
    required: true,
  },
  endTime: {
    type: String,
    required: true,
  },

  examLinkEnabled: {
    type: Boolean,
    default: false,
  },
});

const PreAdmissionExamSchedule = db.model(
  "PreAdmissionExamSchedule",
  preAddmissionExamScheduleSchema
);

module.exports = PreAdmissionExamSchedule;
