const mongoose = require("mongoose");

const subjectComponentSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    maxLength: 200,
  },
  hoursMultiplicationFactor: {
    type: Number,
    default: 0,
  },
});

module.exports = db.model("SubjectComponent", subjectComponentSchema);
