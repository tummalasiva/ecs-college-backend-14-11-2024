const mongoose = require("mongoose");

require("@db/degreeCode/model");
require("@db/subject/model");
require("@db/courseOutcome/model");
require("@db/programOutcome/model");

const coPoMappingSchema = new mongoose.Schema({
  degreeCode: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "DegreeCode",
    required: true,
  },
  subject: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Subject",
    required: true,
  },
  coId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "CourseOutcome",
    required: true,
  },
  poId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "ProgramOutcome",
    required: true,
  },
  contributionLevel: {
    type: Number,
    required: true,
  },
});

module.exports = mongoose.model("CoPoMapping", coPoMappingSchema);
