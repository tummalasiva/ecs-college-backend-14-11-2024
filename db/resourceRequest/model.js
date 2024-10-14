const mongoose = require("mongoose");

require("@db/department/model");
require("@db/employee/model");

const resourceRequestSchema = new mongoose.Schema({
  department: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Department",
    required: true,
  },
  requestedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Employee",
    required: true,
  },
  resourceType: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  quantity: {
    type: Number,
    required: true,
  },
  status: {
    type: String,
    enum: ["Pending", "Approved", "Denied"],
    default: "Pending",
  },
  statusUpdateText: {
    type: String,
    default: "",
  },
});

module.exports = db.model("ResourceRequest", resourceRequestSchema);
