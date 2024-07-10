const mongoose = require("mongoose");

require("@db/school/model");
require("@db/employee/model");
require("@db/class/model");

const subjectSchema = new mongoose.Schema({
  school: {
    type: mongoose.Types.ObjectId,
    ref: "School",
    required: [true, "Please provide schoolId"],
  },
  name: {
    type: String,
    required: [true, "Please provide subject name"],
  },
  code: {
    type: String,
    required: [true, "Please provide subject code"],
  },
  subjectType: {
    type: String,
    enum: ["mandatory", "optional"],
    required: [true, "Please provide subject type"],
  },
  subjectGroup: {
    type: String,
    enum: ["scholastic", "co-scholastic"],
    required: [true, "Please provide subject group"],
  },
  subjectTeachers: {
    type: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Employee",
        required: [true, "Please add subject teacher/teachers"],
      },
    ],
    default: [],
  },

  class: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Class",
    required: [true, "Please provide class"],
  },
  fallbackClass: {
    type: Object,
    required: true,
  },
  note: {
    type: String,
    default: "",
  },
});

const Subject = db.model("Subject", subjectSchema);

module.exports = Subject;
