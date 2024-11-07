const mongoose = require("mongoose");

require("@db/student/model");

const scholarshipSchema = new mongoose.Schema({
  scholarshipName: {
    type: String,
    required: true,
    maxLength: 200,
  },
  amount: {
    type: Number,
    required: true,
  },
  organizationType: {
    type: String,
    required: true,
  },
  nameOfOrganization: {
    type: String,
    required: true,
    maxLength: 200,
  },
  addressOfOrganization: {
    type: String,
    required: true,
    maxLength: 200,
  },
  scholarshipReceivedDate: {
    type: Date,
    required: true,
  },
  document: {
    type: String,
  },
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Student",
    required: true,
  },
});

module.exports = db.model("Scholarship", scholarshipSchema);
