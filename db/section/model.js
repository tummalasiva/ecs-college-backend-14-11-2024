const mongoose = require("mongoose");
const Schema = mongoose.Schema;

require("@db/degreeCode/model");

const sectionSchema = new Schema({
  name: {
    type: String,
    required: [true, "Provide section name"],
  },
  degreeCode: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "DegreeCode",
    required: [true, "Provide degree code"],
  },
  active: {
    type: Boolean,
    default: true,
  },
  maxStrength: {
    type: Number,
    required: [true, "Provide maximum strength"],
  },
  availableSeats: {
    type: Number,
    required: [true, "Provide available seats"],
  },
});

const Section = db.model("Section", sectionSchema);
module.exports = Section;
