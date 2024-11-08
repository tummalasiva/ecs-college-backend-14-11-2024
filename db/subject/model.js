const mongoose = require("mongoose");

require("@db/subjectType/model");
require("@db/degreeCode/model");
require("@db/subjectCategory/model");
require("@db/subjectComponent/model");

const componentAndCreditSchema = new mongoose.Schema({
  component: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "SubjectComponent",
    required: true,
  },
  credits: {
    type: Number,
  },
  hours: {
    type: Number,
  },
});

const courseMaterialSchema = new mongoose.Schema({
  details: {
    type: String,
    required: true,
  },
  link: {
    type: String,
    default: "",
  },
});

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
  totalCredits: {
    type: Number,
    required: true,
  },
  totalHours: {
    type: Number,
    required: true,
  },
  componentsAndCredits: [componentAndCreditSchema],
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
  courseMaterials: [courseMaterialSchema],
  targetAttainmentPercentage: {
    type: Number,
    required: true,
  },
  attendanceUpdatedBy: {
    type: String,
    enum: ["incharge", "lab_faculty"],
    required: true,
    default: "incharge",
  },
  marksUpdatedBy: {
    type: String,
    enum: ["incharge", "lab_faculty"],
    required: true,
    default: "incharge",
  },
});

const Subject = db.model("Subject", subjectSchema);

module.exports = Subject;
