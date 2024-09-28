const mongoose = require("mongoose");

require("@db/employee/model");
require("@db/courseOutcome/model");
require("@db/subject/model");

const savedQuestionsSchema = new mongoose.Schema({
  question: {
    type: String,
    required: true,
  },
  image: {
    type: String,
    default: "",
  },
  approved: {
    type: Boolean,
    default: false,
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Employee",
    required: true,
  },
  coId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "CourseOutcome",
  },
  subject: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Subject",
    required: true,
  },
  marks: {
    type: Number,
    required: true,
  },
  section: {
    type: String,
    required: true,
  },
  blt: {
    type: Number,
    required: true,
  },
  imageRequired: {
    type: Boolean,
    default: false,
  },
});

module.exports = db.model("SavedQuestion", savedQuestionsSchema);
