const mongoose = require("mongoose");

require("@db/school/model");
require("@db/student/model");

const studentCheckoutSchema = new mongoose.Schema({
  school: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "School",
    required: true,
  },
  student: {
    type: mongoose.Types.ObjectId,
    ref: "Student",
    required: true,
  },
  reason: {
    type: String,
    required: [true, "Please provide reason"],
  },
  relationship: {
    type: String,
    required: [true, "Please provide relationship with student"],
  },
  visitorName: {
    type: String,
    required: [true, "Please provide visitor name"],
  },
  visitorContactNumber: {
    type: Number,
    required: [true, "Please provide visitor contact number"],
  },
});

const StudentCheckout = db.model("VisitorStudent", studentCheckoutSchema);

module.exports = StudentCheckout;
