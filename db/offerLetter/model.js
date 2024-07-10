const mongoose = require("mongoose");

require("@db/school/model");

const offerLetterSchema = new mongoose.Schema({
  school: {
    type: mongoose.Types.ObjectId,
    ref: "School",
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
  joiningDate: {
    type: Date,
    default: Date.now,
    required: true,
  },
  offerLetter: {
    type: String,
    required: true,
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Employee",
    required: true,
    select: false,
  },
});
const OfferLetter = db.model("OfferLetter", offerLetterSchema);

module.exports = OfferLetter;
