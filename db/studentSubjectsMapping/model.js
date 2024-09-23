const mongoose = require("mongoose");

require("@db/student/model");
require("@db/academicYear/model");
require("@db/subject/model");

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
  subjects: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Subject",
      required: true,
    },
  ],
});

module.exports = db.model("StudentSubjectMapping", studentSubjectMapping);
