const mongoose = require("mongoose");

const forgotPasswordSchema = new mongoose.Schema({
  code: {
    type: String,
    required: true,
  },
  employee: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Employee",
  },
  date: {
    type: Date,
    default: Date.now,
  },
});

module.exports = db.model("ForgotPassword", forgotPasswordSchema);
