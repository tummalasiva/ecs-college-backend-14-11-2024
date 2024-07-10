const mongoose = require("mongoose");
const Schema = mongoose.Schema;

require("@db/school/model");
require("@db/class/model");
require("@db/employee/model");

const sectionSchema = new Schema({
  school: {
    type: mongoose.Types.ObjectId,
    ref: "School",
    required: true,
  },

  name: {
    type: String,
    required: [true, "Provide section name"],
  },
  class: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Class",
    required: [true, "Provide class"],
  },
  fallbackClass: {
    type: Object,
    required: true,
  },
  sectionTeacher: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Employee",
    default: null,
  },

  sectionOrder: {
    type: Number,
    // required: true,
  },
  note: {
    type: String,
    default: "",
  },
  active: {
    type: Boolean,
    required: true,
  },
  isPublic: {
    type: Boolean,
    default: false,
  },
});

const Section = db.model("Section", sectionSchema);
module.exports = Section;
