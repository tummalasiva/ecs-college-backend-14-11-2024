const mongoose = require("mongoose");
require("@db/school/model");

const guardianFeedbackSchema = new mongoose.Schema({
  school: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "School",
    required: true,
  },
  parentName: {
    type: String,
    required: [true, "Provide guardian name"],
  },
  studentName: {
    type: String,
    required: [true, "Provide student name"],
  },
  className: {
    type: String,
    required: [true, "Provide class"],
  },
  feedback: {
    type: String,
    required: [true, "provide feedback"],
  },
  status: {
    type: String,
    enum: ["pending", "approved", "rejected"],
    required: [true, "Provide status"],
    default: "pending",
  },
});
const GuardianFeedback = db.model("GuardianFeedback", guardianFeedbackSchema);

module.exports = GuardianFeedback;
