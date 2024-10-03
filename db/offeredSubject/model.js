const mongoose = require("mongoose");

require("@db/semester/model");
require("@db/subject/model");
require("@db/academicYear/model");
require("@db/degreeCode/model");
require("@db/employee/model");

const offeredSubjectSchema = new mongoose.Schema({
  subjects: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Subject",
      required: true,
    },
  ],
  semester: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Semester",
    required: true,
  },
  academicYear: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "AcademicYear",
    required: true,
  },
  year: {
    type: Number,
    required: true,
  },
  degreeCode: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "DegreeCode",
    required: true,
  },
  registeredStudents: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Student",
    },
  ],
  active: {
    type: Boolean,
    default: false,
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Employee",
    required: true,
  },
});

module.exports = db.model("OfferedSubject", offeredSubjectSchema);
