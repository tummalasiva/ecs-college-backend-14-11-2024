const mongoose = require("mongoose");

require("@db/department/model");

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
  department: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Department",
    required: true,
  },
});

module.exports = db.model("ExamTitle", examTitleSchema);
