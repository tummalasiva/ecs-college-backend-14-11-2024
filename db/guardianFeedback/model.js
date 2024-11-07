const mongoose = require("mongoose");

require("@db/guardian/model");

const guardianFeedbackSchema = new mongoose.Schema({
  guardian: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Guardian",
    required: true,
  },
  feedback: {
    type: String,
    required: [true, "provide feedback"],
  },
  category: {
    type: String,
    enum: [
      "Academics",
      "Facilities",
      "Extracurricular Activities",
      "Support Staff",
      "Other",
    ],
    required: [true, "provide feedback category"],
  },
});
const GuardianFeedback = db.model("GuardianFeedback", guardianFeedbackSchema);

module.exports = GuardianFeedback;
