const mongoose = require("mongoose");

require("@db/degreeCode/model");

const programOutcomeSchema = new mongoose.Schema({
  poId: {
    type: String,
    required: true,
  },
  degreeCode: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "DegreeCode",
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
});

module.exports = db.model("ProgramOutcome", programOutcomeSchema);
