const mongoose = require("mongoose");

require("@db/employee/model");
require("@db/department/model");

const publicationSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ["Conferance", "Journal"],
    required: true,
  },
  details: {
    type: String,
    required: true,
  },
  date: {
    type: Date,
    required: true,
  },
  department: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Department",
    required: true,
  },
  file: {
    type: String,
    default: "",
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Employee",
    required: true,
  },
  approved: {
    type: Boolean,
    default: false,
  },
});

module.exports = db.model("publication", publicationSchema);
