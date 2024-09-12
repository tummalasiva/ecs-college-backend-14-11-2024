const mongoose = require("mongoose");

const subjectTypeSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
    maxLength: 50,
  },
  description: {
    type: String,
    default: "",
  },
});

module.exports = db.model("SubjectType", subjectTypeSchema);
