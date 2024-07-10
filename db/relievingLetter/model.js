const mongoose = require("mongoose");

require("@db/school/model");

const relievingLetterSchema = new mongoose.Schema({
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
  relievingLetter: {
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
const RelievingLetter = db.model("RelievingLetter", relievingLetterSchema);

module.exports = RelievingLetter;
