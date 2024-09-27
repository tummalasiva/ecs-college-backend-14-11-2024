const mongoose = require("mongoose");

const programOutcomeSchema = new mongoose.Schema({
  poId: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
});

module.exports = db.model("ProgramOutcome", programOutcomeSchema);
