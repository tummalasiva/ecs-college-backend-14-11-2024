const mongoose = require("mongoose");

require("@db/degreeCode/model");
require("@db/subject/model");

const coOutcomeSchema = new mongoose.Schema({
  coId: {
    type: String,
    required: true,
  },
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
  description: {
    type: String,
    required: true,
  },
});

module.exports = db.model("COOutcome", coOutcomeSchema);
