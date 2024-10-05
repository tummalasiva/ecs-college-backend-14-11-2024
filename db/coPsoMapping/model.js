const mongoose = require("mongoose");

require("@db/degreeCode/model");
require("@db/subject/model");
require("@db/courseOutcome/model");
require("@db/pso/model");

const coPsoMappingSchema = new mongoose.Schema({
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
  psoId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Pso",
    required: true,
  },
  contributionLevel: {
    type: Number,
    required: true,
  },
});

module.exports = db.model("CoPsoMapping", coPsoMappingSchema);
