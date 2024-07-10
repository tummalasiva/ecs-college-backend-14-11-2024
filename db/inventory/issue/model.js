const mongoose = require("mongoose");

require("@db/school/model");
require("@db/inventory/item/model");
require("@db/employee/model");
require("@db/student/model");

const issueSchema = new mongoose.Schema({
  item: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Item",
    required: true,
  },
  quantity: {
    type: Number,
    required: true,
  },
  pricePerItem: {
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
  fromSchool: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "School",
    required: false,
  },
  toSchool: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "School",
    required: false,
  },
  issuedToRoleName: {
    type: String,
    required: true,
  },
  issuedTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: function () {
      return this.issuedToRoleName === "STUDENT" ? "Student" : "Employee";
    },
    required: true,
  },
  issuedAt: {
    type: Date,
    default: Date.now,
  },
  issuedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Employee",
    required: true,
  },
  status: {
    type: String,
    enum: {
      values: ["Returned", "Pending", "Issued", "Deleted"],
      message: "Please select a valid issue status",
    },
    required: true,
  },
  school: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "School",
    required: true,
  },
  notes: {
    type: String,
    default: "",
  },
});

const Issue = db.model("Issue", issueSchema);

module.exports = Issue;
