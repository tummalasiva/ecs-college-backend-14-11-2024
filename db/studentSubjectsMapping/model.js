const mongoose = require("mongoose");

require("@db/student/model");
require("@db/academicYear/model");
require("@db/subject/model");

const registeredSubjectsSchema = new mongoose.Schema({
  subject: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Subject",
    required: true,
  },
  status: {
    type: String,
    required: true,
    enum: ["registered", "withdrawn", "failed", "passed", "re-registered"],
  },
  registeredDate: {
    type: Date,
    required: true,
  },
});

const studentSubjectMapping = new mongoose.Schema({
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Student",
    required: true,
  },
  academicYear: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "AcademicYear",
    required: true,
  },
  semester: {
    type: String,
    required: true,
  },
  registeredSubjects: [registeredSubjectsSchema],
});

module.exports = db.model("StudentSubjectMapping", studentSubjectMapping);
