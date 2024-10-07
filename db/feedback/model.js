const mongoose = require("mongoose");

require("@db/courseOutcome/model");
require("@db/questionnaire/model");
require("@db/student/model");

const submissionSchema = new mongoose.Schema({
  text: {
    type: String,
    required: true,
  },
  co: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "CourseOutcome",
      required: true,
    },
  ],
  coAttainmentThreshold: {
    type: Number,
    required: true,
  },
  score: {
    type: Number,
    required: true,
    min: 1,
    max: 5,
  },
});
const feedbackSchema = new mongoose.Schema({
  questionnaire: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Questionnaire",
    required: true,
  },
  submittedResponse: [submissionSchema],
  submittedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Student",
    required: true,
  },
});

module.exports = db.model("Feedback", feedbackSchema);
