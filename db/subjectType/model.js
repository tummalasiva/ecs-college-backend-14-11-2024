const mongoose = require("mongoose");

const subjectTypes = [
  "Theory",
  "Lab",
  "Theory + Lab",
  "Project",
  "Seminar",
  "Workshop",
  "Field Work",
  "Internship",
  "Capstone",
  "Independent Study",
  "Clinical Practice",
  "Colloquium",
  "Tutorial",
  "Thesis",
  "Simulation",
  "Case Study Analysis",
  "Language Lab",
  "Studio",
  "Skill Development",
];

const subjectTypeSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    enum: subjectTypes,
  },
  description: {
    type: String,
    default: "",
  },
});

module.exports = db.model("SubjectType", subjectTypeSchema);
