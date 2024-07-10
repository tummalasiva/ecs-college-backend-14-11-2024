const mongoose = require("mongoose");

require("@db/employee/model");
require("@db/student/model");
require("@db/school/model");
require("@db/library/book/model");
require("@db/library/periodical/model");

const issueSchema = new mongoose.Schema({
  school: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "School",
    required: true,
  },
  issueDate: {
    type: Date,
    required: [true, "Provide issue date"],
  },
  book: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Book",
  },
  periodical: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Periodical",
  },
  quantity: {
    type: Number,
    required: [true, "Provide book quantity"],
  },
  dueDate: {
    type: Date,
    required: [true, "Provide due date"],
  },
  issuedToType: {
    type: String,
    enum: {
      values: ["student", "employee"],
    },
    required: [true, "Provide issuedTo Type"],
  },
  issuedTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: function () {
      return this.issuedToType === "student" ? "Student" : "Employee";
    },
    required: [true, "Provide issued to"],
  },
  submissionDate: {
    type: Date,
    default: null,
  },
});

const Issue = db.model("Issue", issueSchema);
module.exports = Issue;
