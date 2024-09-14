const mongoose = require("mongoose");

require("@db/building/model");
require("@db/buildingRoom/model");
require("@db/department/model");
require("@db/school/model");

const assetSchema = new mongoose.Schema({
  school: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "School",
    required: true,
  },
  name: {
    type: String,
    required: true,
    maxLength: 200,
  },
  category: {
    type: String,
    required: true,
    maxLength: 200,
  },
  building: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Building",
    required: true,
  },
  room: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "BuildingRoom",
    required: true,
  },
  purchaseDate: {
    type: Date,
  },
  vendor: {
    type: String,
    maxLength: 200,
  },
  cost: {
    type: Number,
    required: true,
  },
  serialNumber: {
    type: String,
    required: true,
    unique: true,
  },
  warrantyPeriod: {
    type: Number,
  },
  currentStatus: {
    type: String,
    required: true,
    enum: ["In Use", "Available", "Disposed", "Under Maintenance"],
  },
  assignedTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Department",
  },
  lastMaintenanceDate: {
    type: Date,
  },
  nextMaintenanceDue: {
    type: Date,
  },
});

module.exports = db.model("Asset", assetSchema);
