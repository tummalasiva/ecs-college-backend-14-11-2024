const mongoose = require("mongoose");

require("@db/academicYear/model");
require("@db/fee/feeMap/model");
require("@db/student/model");
require("@db/employee/model");
require("@db/fee/receipt/model");
require("@db/fee/feeMapCategory/model");

const feePaidDetailsSchema = new mongoose.Schema({
  feeMapCategory: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "FeeMapCategory",
    required: true,
  },
  actualAmount: {
    type: Number,
    required: true,
  },
  paidAmount: {
    type: Number,
    required: true,
  },
});

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
  payeeAdmissionNumber: {
    type: Number,
    required: true,
  },
  installmentId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
  },
  feePaidDetails: [feePaidDetailsSchema],

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
