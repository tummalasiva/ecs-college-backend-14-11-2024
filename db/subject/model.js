const mongoose = require("mongoose");

require("@db/subjectType/model");
require("@db/degreeCode/model");

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
  preRequisite: {
    type: [{ type: mongoose.Schema.Types.ObjectId, ref: "Subject" }],
    default: [],
  },
  credits: {
    type: Number,
    default: 0,
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
