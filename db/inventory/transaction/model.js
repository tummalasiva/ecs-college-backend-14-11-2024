const mongoose = require("mongoose");

require("@db/school/model");
require("@db/inventory/item/model");
require("@db/inventory/vendor/model");
require("@db/student/model");
require("@db/employee/model");

const transactionSchema = new mongoose.Schema({
  school: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "School",
    required: true,
  },
  item: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Item",
    required: true,
  },
  date: {
    type: Date,
    default: Date.now,
  },
  pricePerItem: {
    type: Number,
    required: true,
  },
  quantity: {
    type: Number,
    required: true,
  },
  total: {
    type: Number,
    default: function () {
      return this.pricePerItem * this.quantity;
    },
    required: true,
  },
  trasactionMode: {
    type: String,
    enum: {
      values: ["Cash", "Upi", "Netbanking", "Cheque", "Card", "Others", "Null"],
      message: "Please select a valid mode of transaction",
    },
    required: true,
  },
  type: {
    type: String,
    enum: {
      values: ["In", "Out"],
      message: "Please select a valid transaction type",
    },
    required: true,
  },
  purpose: {
    type: String,
    enum: {
      values: [
        "Inhouse",
        "Damage",
        "Purchase",
        "Sell",
        "Return",
        "InventoryUpdate",
      ],
      message: "Please mention a valid transaction purpose",
    },
    required: true,
  },
  fromType: {
    type: String,
    enum: {
      values: ["School", "Vendor"],
      message: "Please select a valid Transaction from type",
    },
    required: true,
  },
  toType: {
    type: String,
    enum: {
      values: ["School", "Vendor", "Student", "Employee"],
      message: "Please select a valid Transaction from type",
    },
    required: true,
  },
  from: {
    type: mongoose.Schema.Types.ObjectId,
    ref: function () {
      return this.fromType === "School" ? "School" : "Vendor";
    },
    required: true,
  },
  to: {
    type: mongoose.Schema.Types.ObjectId,
    ref: function () {
      if (this.toType === "School") return "School";
      else if (this.toType === "Vendor") return "Vendor";
      else if (this.toType === "Student") return "Student";
      else return "Employee";
    },
    required: true,
  },
  status: {
    type: String,
    enum: {
      values: ["Pending", "Completed", "Cancelled"],
      message: "Please select a valid transaction status",
    },
    default: "Pending",
  },
  description: {
    type: String,
    default: "",
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Employee",
    required: true,
  },

  invoice: {
    type: String,
    default: null,
  },
});

const Transaction = db.model("Transaction", transactionSchema);

module.exports = Transaction;
