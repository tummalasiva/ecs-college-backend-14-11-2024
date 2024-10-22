const mongoose = require("mongoose");

require("@db/subject/model");
require("@db/semester/model");
require("@db/degreeCode/model");
require("@db/student/model");
require("@db/employee/model");

const wishlistSchema = new mongoose.Schema({
  subjectCategory: {},
  semester: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Semester",
    required: true,
  },
  registerdStudents: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Student",
      required: true,
    },
  ],
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Employee",
    required: true,
  },
  maximumLimit: {
    type: Number,
    required: true,
  },
  enableRegistration: {
    type: Boolean,
    default: false,
  },
});

module.exports = db.model("Wishlist", wishlistSchema);
