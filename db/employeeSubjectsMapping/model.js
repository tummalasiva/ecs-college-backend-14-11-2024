const mongoose = require("mongoose");

require("@db/academicYear/model");
require("@db/employee/model");
require("@db/subject/model");
require("@db/degreeCode/model");

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
    type: String,
    required: true,
  },
  subjects: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Subject",
      required: true,
    },
  ],
});

module.exports = db.model("EmployeeSubjectMapping", employeeSubjectMapping);
