const mongoose = require("mongoose");

require("@db/degreeCode/model");

const detailsSchema = new mongoose.Schema({
  description: {
    type: String,
    required: true,
    maxLength: 1000,
  },
  credits: {
    type: Number,
    required: true,
  },
});

const curriculumSchema = new mongoose.Schema({
  degreeCode: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "DegreeCode",
    required: true,
  },
  details: [detailsSchema],
});

module.exports = db.model("Curriculum", curriculumSchema);
