const mongoose = require("mongoose");

require("@db/student/model");
require("@db/academicYear/model");
require("@db/employee/model");
require("@db/degreeCode/model");

const labBatchSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Provide lab batch name"],
  },
  students: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Student",
    },
  ],
  semester: {
    type: String,
    required: [true, "Provide semester"],
  },
  academicYear: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "AcademicYear",
    required: true,
  },
  degreeCode: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "DegreeCode",
    required: true,
  },
  faculty: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Employee",
    required: [true, "Provide faculty"],
  },
});

module.exports = db.model("LabBatch", labBatchSchema);
