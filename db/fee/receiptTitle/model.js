const mongoose = require("mongoose");

require("@db/employee/model");

const receiptTitleSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Employee",
  },
  active: {
    type: Boolean,
    default: true,
  },
});

const ReceiptTitle = db.model("ReceiptTitle", receiptTitleSchema);

module.exports = ReceiptTitle;
