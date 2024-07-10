const mongoose = require("mongoose");
const Schema = mongoose.Schema;

require("@db/school/model");
require("@db/class/model");
require("@db/section/model");
require("@db/subject/model");

const assignmentSchema = new Schema({
  school: {
    type: Schema.Types.ObjectId,
    ref: "School",
    required: true,
  },
  title: {
    type: String,
    trim: true,
    required: [true, "Provide assignment title"],
  },
  class: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Class",
    required: [true, "Provide class"],
  },
  section: {
    type: String,
    required: [true, "provide section"],
  },
  subject: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Subject",
    required: [true, "Provide subject"],
  },
  assignmentType: {
    type: String,
    enum: ["class", "assignment"],
    required: [true, "Provide assignment type"],
  },
  attachmentType: {
    type: String,
    enum: {
      values: ["Link", "File"],
      message: "Please select a valid attachment type",
    },
    required: true,
  },
  deadline: {
    type: Date,
    required: [true, "Provide assignment"],
  },
  file: {
    type: String,
    required: function () {
      return this.attachmentType === "File"
        ? [true, "Please upload the file!"]
        : false;
    },
  },
  link: {
    type: String,
    required: function () {
      return this.attachmentType === "Link"
        ? [true, "Please provide the link!"]
        : false;
    },
  },
  note: {
    type: String,
    default: "",
  },
  isPublic: {
    type: Boolean,
    default: false,
  },
});

const Assignment = db.model("Assignment", assignmentSchema);
module.exports = Assignment;
