const mongoose = require("mongoose");

require("@db/subjectType/model");
require("@db/degreeCode/model");
require("@db/subjectCategory/model");

const subjectSchema = new mongoose.Schema({
  degreeCode: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "DegreeCode",
    required: function () {
      return this.programSpecific ? true : false;
    },
  },
  semester: {
    type: Number,
    required: [true, "Please provide semester"],
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
  programSpecific: {
    type: Boolean,
    default: true,
  },
  subjectType: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "SubjectType",
    required: [true, "Please provide subject type"],
  },
  subjectCategory: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "SubjectCategory",
    required: [true, "Please provide subject category"],
  },
  syllabus: {
    type: [String],
    default: [],
  },
});

const Subject = db.model("Subject", subjectSchema);

module.exports = Subject;
