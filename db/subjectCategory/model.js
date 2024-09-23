const mongoose = require("mongoose");

const subjectCategorySchema = new mongoose.Schema({
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

module.exports = db.model("SubjectCategory", subjectCategorySchema);
