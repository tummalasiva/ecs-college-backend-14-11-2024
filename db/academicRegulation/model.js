const mongoose = require("mongoose");

const academicRegulationSchema = new mongoose.Schema({
  points: [String],
});

module.exports = dbb.model("AcademicRegulation", academicRegulationSchema);
