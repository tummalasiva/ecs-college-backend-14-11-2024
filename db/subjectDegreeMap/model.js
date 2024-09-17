const mongoose = require("mongoose");

require("@db/subject/model");
require("@db/degreeCode/model");

const subjectDegreeMapSchema = new mongoose.Schema({
  subject: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Subject",
    required: true,
  },
  degreeCode: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "DegreeCode",
    required: true,
  },
  year: {
    type: Number,
    required: true,
  },
  semester: {
    type: Number,
    required: true,
  },
});

module.exports = db.model("SubjectDegreeMap", subjectDegreeMapSchema);
