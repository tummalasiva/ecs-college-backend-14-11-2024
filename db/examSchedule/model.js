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
    default: function () {
      return this.writtenMarks + this.practicalMarks;
    },
  },
  writtenMarks: {
    type: Number,
    required: true,
  },
  practicalMarks: {
    type: Number,
    required: function () {
      return this.practical === "active" ? true : false;
    },
    default: 0,
  },
  minimumMarks: {
    type: Number,
    required: [true, "Provide minimum marks"],
  },
  practical: {
    type: String,
    enum: ["inactive", "active"],
    default: "inactive",
  },
  orderSequence: {
    type: Number,
    default: Number.POSITIVE_INFINITY,
    required: [true, "Please provide order sequence"],
  },
});

const ExamSchedule = db.model("ExamSchedule", examScheduleSchema);

module.exports = ExamSchedule;

// static async getExamResult(req) {
//   try {
//     const { classId, sectionId, examId } = req.query;

//     const [
//       academicYearData,
//       classData,
//       sectionData,
//       examData,
//       examScheduleData,
//     ] = await Promise.all([
//       academicYearQuery.findOne({ active: true }),
//       classQuery.findOne({ _id: classId }),
//       sectionQuery.findOne({ _id: sectionId, class: classId }),
//       examTermQuery.findOne({ _id: examId }),
//       examScheduleQuery.findAll({ examTerm: examId, class: classId }),
//     ]);

//     if (!academicYearData)
//       return notFoundError("No active academic year found");
//     if (!classData) return notFoundError("Class not found");
//     if (!sectionData) return notFoundError("Section not found");
//     if (!examData) return notFoundError("Exam not found");
//     if (!examScheduleData.length)
//       return notFoundError("Exam schedules not found for this exam");

//     const students = await studentQuery.findAll({
//       "academicInfo.class": classId,
//       "academicInfo.section":sectionId,
//       academicYear: academicYearData._id,
//       active: true,
//     })

//     let studentIds = students.map(s => s._id);
//     let examSc

//   } catch (error) {
//     throw error;
//   }
// }
