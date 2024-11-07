const mongoose = require("mongoose");

require("@db/student/model");
require("@db/subject/model");
require("@db/employee/model");

const reExamSchema = new mongoose.Schema({
  examName: {
    type: String,
    required: true,
  },
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Student",
    required: true,
  },
  subject: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Subject",
    required: true,
  },
  applicationDate: {
    type: Date,
    default: Date.now,
  },
  reason: {
    type: String,
    maxLength: 500,
  },
  document: {
    type: String,
  },
  status: {
    type: String,
    enum: ["Pending", "Approved", "Rejected", "In Review"],
    default: "Pending",
  },
  reviewedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Employee",
  },
  reviewDate: {
    type: Date,
  },
  remarks: {
    type: String,
    maxLength: 500,
  },
  paymentStatus: {
    type: String,
    enum: ["Not Paid", "Paid", "Refunded"],
    default: "Not Paid",
  },
  paymentDetails: {
    transactionId: {
      type: String,
      maxLength: 50,
    },
    amount: {
      type: Number,
      default: 0,
    },
    paymentDate: {
      type: Date,
    },
  },
});

module.exports = db.model("ReExamApplication", reExamSchema);
