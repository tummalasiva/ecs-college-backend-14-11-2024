const mongoose = require("mongoose");

require("@db/school/model");
require("@db/student/model");
require("@db/employee/model");

const meetingSchema = new mongoose.Schema({
  school: {
    type: mongoose.Types.ObjectId,
    ref: "School",
    required: true,
  },
  roomId: {
    type: String,
    required: true,
  },
  expiryDate: {
    type: Date,
    required: true,
  },
  expiryTime: {
    type: String,
    required: true,
  },
  startDate: {
    type: Date,
    required: true,
  },
  startTime: {
    type: String,
    required: true,
  },
  createdBy: {
    type: mongoose.Types.ObjectId,
    ref: "Employee",
    required: true,
  },
  deleted: {
    type: Boolean,
    default: false,
  },
  classId: [
    {
      type: mongoose.Types.ObjectId,
      required: function () {
        return this.participantType === "Class Students" ? true : false;
      },
      ref: "Class",
    },
  ],
  meetingType: {
    type: String,
    enum: {
      values: ["OneONoneCall", "GroupCall", "LiveStreaming"],
      message: "Please select a valid meeting type!",
    },
    default: "LiveStreaming",
  },
  participantType: {
    type: String,
    enum: {
      values: ["Single", "Class Students", "Selected"],
      message: "Please select a valid participant type!",
    },
    default: "Class Students",
  },
  userTypes: {
    type: [String],
    enum: {
      values: ["student", "employee"],
    },
    required: function () {
      return this.participantType !== "Class Students" ? true : false;
    },
  },
  employeeParticipants: [
    {
      type: mongoose.Types.ObjectId,
      ref: "Employee",
    },
  ],
  studentParticipants: [
    {
      type: mongoose.Types.ObjectId,
      ref: "Student",
    },
  ],
});

const Meeting = db.model("Meeting", meetingSchema);

module.exports = Meeting;
