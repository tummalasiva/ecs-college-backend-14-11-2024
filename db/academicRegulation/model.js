const mongoose = require("mongoose");

const academicRegulationSchema = new mongoose.Schema({
  points: [String],
});

module.exports = db.model("AcademicRegulation", academicRegulationSchema);
