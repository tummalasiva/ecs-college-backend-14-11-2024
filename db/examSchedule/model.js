// const mongoose = require("mongoose");

// require("@db/school/model");
// require("@db/examTerm/model");
// require("@db/class/model");
// require("@db/subject/model");

// const examScheduleSchema = new mongoose.Schema({
//   school: {
//     type: mongoose.Schema.Types.ObjectId,
//     ref: "School",
//     required: true,
//   },
//   examTerm: {
//     type: mongoose.Schema.Types.ObjectId,
//     ref: "ExamTerm",
//     required: [true, "Provide exam term id"],
//   },
//   class: {
//     type: mongoose.Schema.Types.ObjectId,
//     ref: "Class",
//     required: [true, "Provide class id"],
//   },
//   subject: {
//     type: mongoose.Schema.Types.ObjectId,
//     ref: "Subject",
//     required: [true, "provide subject id"],
//   },
//   examDate: {
//     type: String,
//     required: [true, "Provide exam date"],
//   },
//   startTime: {
//     type: String,
//     required: [true, "Provide start time"],
//   },
//   endTime: {
//     type: String,
//     required: [true, "Provide end time"],
//   },
//   marksFreezDate: {
//     type: String,
//     required: [true, "Please provide marks freeze date."],
//   },
//   maximumMarks: {
//     type: Number,
//     required: [true, "Provide max marks"],
//     default: function () {
//       return this.writtenMarks + this.practicalMarks;
//     },
//   },
//   writtenMarks: {
//     type: Number,
//     required: true,
//   },
//   practicalMarks: {
//     type: Number,
//     required: function () {
//       return this.practical === "active" ? true : false;
//     },
//     default: 0,
//   },
//   minimumMarks: {
//     type: Number,
//     required: [true, "Provide minimum marks"],
//   },
//   practical: {
//     type: String,
//     enum: ["inactive", "active"],
//     default: "inactive",
//   },
//   orderSequence: {
//     type: Number,
//     default: Number.POSITIVE_INFINITY,
//     required: [true, "Please provide order sequence"],
//   },
// });

// const ExamSchedule = db.model("ExamSchedule", examScheduleSchema);

// module.exports = ExamSchedule;

const mongoose = require("mongoose");

const examScheduleSchema = new mongoose.Schema({
  examTitle: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "ExamTitle",
    required: true,
  },
  subject: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Subject",
    required: true,
  },
  date: {
    type: Date,
    required: true,
  },
  slot: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "ExamSlot",
    required: true,
  },
  building: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Building",
    required: true,
  },
  room: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "BuildingRoom",
    required: true,
  },
  seat: {
    type: String,
    required: true,
  },
});

module.exports = db.model("ExamSchedule", examScheduleSchema);
