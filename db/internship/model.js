const mongoose = require("mongoose");

require("@db/student/model");

const internshipSchema = new mongoose.Schema({
  fromDate: {
    type: Date,
    required: true,
  },
  toDate: {
    type: Date,
    required: true,
  },
  companyName: {
    type: String,
    required: true,
  },
  contactPerson: {
    type: String,
    required: true,
  },
  officialPhoneNumber: {
    type: String,
    required: true,
  },
  officialEmailId: {
    type: String,
    required: true,
  },
  officialWebsite: {
    type: String,
    required: true,
  },
  document: {
    type: String,
    required: true,
  },
  approved: {
    type: Boolean,
    default: false,
  },
  appliedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Student",
    required: true,
  },
});

module.exports = db.model("Internship", internshipSchema);
