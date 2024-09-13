const mongoose = require("mongoose");

const subjectSchema = new mongoose.Schema({
  degreeCode: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "DegreeCode",
    required: true,
  },
  subjectCode: {
    type: String,
    required: [true, "Please provide subject code"],
    unique: true,
  },
  name: {
    type: String,
    required: [true, "Please provide subject name"],
  },

  subjectType: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "SubjectType",
    required: [true, "Please provide subject type"],
  },

  syllabus: {
    type: [String],
    default: [],
  },
});

const Subject = db.model("Subject", subjectSchema);

module.exports = Subject;
