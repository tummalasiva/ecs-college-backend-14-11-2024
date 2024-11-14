const mongoose = require("mongoose");

const VALID_BUILDING_TYPES = [
  "Residential",
  "Academic",
  "Academic/Resource",
  "Administrative",
];

const buildingSchema = new mongoose.Schema({
  name: {
    type: "String",
    required: true,
    maxLength: 255,
  },
  buildingType: {
    type: String,
    required: true,
    enum: VALID_BUILDING_TYPES,
  },
  numberOfFloors: {
    type: Number,
    required: true,
    min: 1,
  },
  location: {
    longitude: {
      type: String,
    },
    latitude: {
      type: String,
    },
  },
});

module.exports = db.model("Building", buildingSchema);
