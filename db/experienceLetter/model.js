const mongoose = require("mongoose");

require("@db/school/model");

const experienceLetterSchema = new mongoose.Schema({
  school: {
    type: mongoose.Types.ObjectId,
    ref: "School",
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
  joiningDate: {
    type: Date,
    default: Date.now,
    required: true,
  },
  experienceLetter: {
    type: String,
    required: true,
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Employee",
    required: true,
    select: false,
  },
});
const ExperienceLetter = db.model("ExperienceLetter", experienceLetterSchema);

module.exports = ExperienceLetter;
