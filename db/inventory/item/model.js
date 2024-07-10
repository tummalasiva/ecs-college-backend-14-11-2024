const mongoose = require("mongoose");

require("@db/school/model");
require("@db/department/model");
require("@db/employee/model");

const itemSchema = new mongoose.Schema({
  school: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "School",
    required: true,
  },
  name: {
    type: String,
    trim: true,
    required: true,
    maxLength: [200, "Name can be maximum of 200 characters"],
  },
  itemId: {
    type: String,
    unique: [true, "Please provide uniquee item id"],
    required: true,
  },
  description: {
    type: String,
    trim: true,
    maxLength: [500, "Description can be maximum of 500 characters"],
  },
  brand: {
    type: String,
    trim: true,
    required: true,
    maxLength: [200, "Brand name can be maximum of 200 characters"],
  },
  department: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Department",
    default: null,
  },
  addedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Employee",
    required: true,
  },
});

const Item = db.model("Item", itemSchema);

module.exports = Item;
