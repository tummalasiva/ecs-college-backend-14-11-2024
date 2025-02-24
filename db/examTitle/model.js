const mongoose = require("mongoose");

const examTitleSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
    maxLength: 200,
  },
  mode: {
    type: String,
    required: true,
    enum: {
      values: ["online", "offline", "others"],
    },
    default: "offline",
  },
  description: {
    type: String,
    default: "",
  },
  eligibilityRequired: {
    type: Boolean,
    default: false,
  },
  examType: {
    type: String,
    enum: {
      values: ["internal", "external"],
    },
    default: "internal",
  },
});

module.exports = db.model("ExamTitle", examTitleSchema);
