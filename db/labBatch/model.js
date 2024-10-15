const mongoose = require("mongoose");

require("@db/student/model");
require("@db/employee/model");
require("@db/degreeCode/model");
require("@db/semester/model");
require("@db/subject/model");
require("@db/section/model");

const labBatchSchema = new mongoose.Schema({
  subject: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Subject",
    required: [true, "Provide subject"],
  },
  section: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Section",
    required: [true, "Provide section"],
  },
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
    type: mongoose.Schema.Types.ObjectId,
    ref: "Semester",
    required: [true, "Provide semester"],
  },

  degreeCode: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "DegreeCode",
    required: true,
  },
  year: {
    type: Number,
    required: [true, "Provide year"],
  },
  faculty: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Employee",
    required: [true, "Provide faculty"],
  },
});

module.exports = db.model("LabBatch", labBatchSchema);
