const mongoose = require("mongoose");

const degreeSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    maxLength: 200,
  },
  shortName: {
    type: String,
    required: true,
    maxLength: 100,
  },
  duration: {
    type: Number,
    required: true,
  },
  degreeType: {
    type: String,
    required: true,
    enum: ["UG", "PG", "DG", "PD"],
  },
});

module.exports = mongoose.model("Degree", degreeSchema);
