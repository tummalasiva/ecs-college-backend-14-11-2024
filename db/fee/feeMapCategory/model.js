const mongoose = require("mongoose");

require("@db/school/model");
require("@db/fee/feeMap/model");

const feeMapCatgorySchema = new mongoose.Schema({
  priority: {
    type: Number,
    required: true,
  },
  school: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "School",
    required: true,
  },
  feeMap: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "FeeMap",
    required: true,
  },
  name: {
    type: String,
    trim: true,
    required: true,
  },
  description: {
    type: String,
    trim: true,
    default: "",
  },
  amount: {
    type: Number,
    required: true,
  },
  compulsory: {
    type: Boolean,
    required: true,
    default: true,
  },
});

const FeeMapCategory = db.model("FeeMapCategory", feeMapCatgorySchema);

module.exports = FeeMapCategory;
