const mongoose = require("mongoose");

require("@db/department/model");

const copoAssessmentDistributionSchema = new mongoose.Schema({
  directAssessment: {
    type: Number,
    required: true,
  },
  indirectAssessment: {
    type: Number,
    required: true,
  },
  department: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Department",
    required: true,
  },
});

module.exports = db.model(
  "CoPoAssessmentDistribution",
  copoAssessmentDistributionSchema
);
