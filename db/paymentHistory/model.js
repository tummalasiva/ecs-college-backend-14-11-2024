const mongoose = require("mongoose");
const moment = require("moment");

require("@db/employee/model");
require("@db/school/model");

const paymentHistorySchema = new mongoose.Schema({
  generatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Employee",
    required: true,
  },
  data: {
    type: String,
    required: true,
  },
  monthlyPayments: {
    type: Object,
  },

  month: {
    type: String,
    default: function () {
      return moment(this.createdAt).format("MMMM");
    },
  },
  year: {
    type: String,
    default: function () {
      return moment(this.createdAt).format("YYYY");
    },
  },
  school: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "School",
    required: true,
  },
});
const PaymentHistory = db.model("PaymentHistory", paymentHistorySchema);

module.exports = PaymentHistory;
