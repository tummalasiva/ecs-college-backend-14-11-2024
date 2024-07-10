const mongoose = require("mongoose");

require("@db/academicYear/model");
require("@db/fee/feeMap/model");
require("@db/student/model");
require("@db/employee/model");
require("@db/fee/receipt/model");

const pastFeeDueSchema = new mongoose.Schema({
  academicYear: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "AcademicYear",
    required: true,
  },
  feeMap: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "FeeMap",
    required: true,
  },
  payeeType: {
    type: String,
    enum: {
      values: ["employee", "student"],
      message: "",
    },
    default: "student",
  },
  payee: {
    type: mongoose.Schema.Types.ObjectId,
    ref: function () {
      return this.payeeType === "student" ? "Student" : "Employee";
    },
    required: true,
  },
  installmentId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
  },
  amount: {
    type: Number,
    required: true,
  },
  cleared: {
    type: Boolean,
    default: false,
  },
  receipt: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Receipt",
    required: true,
  },
  collectedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Employee",
  },
  paidAt: {
    type: Date,
    default: null,
  },
});

const PastFeeDue = db.model("PastFeeDue", pastFeeDueSchema);

module.exports = PastFeeDue;
