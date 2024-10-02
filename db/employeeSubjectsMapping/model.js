const mongoose = require("mongoose");

require("@db/academicYear/model");
require("@db/employee/model");
require("@db/subject/model");
require("@db/degreeCode/model");
require("@db/section/model");
require("@db/semester/model");

const registeredSubjectsSchema = new mongoose.Schema({
  subject: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Subject",
    required: true,
  },
  section: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Section",
    required: true,
  },
});

const employeeSubjectMapping = new mongoose.Schema({
  degreeCode: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "DegreeCode",
    required: true,
  },
  academicYear: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "AcademicYear",
    required: true,
  },
  employee: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Employee",
    required: true,
  },
  semester: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Semester",
    required: true,
  },
  subjects: [registeredSubjectsSchema],
});

module.exports = db.model("EmployeeSubjectMapping", employeeSubjectMapping);
