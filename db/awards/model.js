const mongoose = require("mongoose");
const Schema = mongoose.Schema;

require("@db/school/model");

const awardsSchema = new Schema({
  school: {
    type: Schema.Types.ObjectId,
    ref: "School",
    required: true,
  },
  title: {
    type: String,
    required: [true, "Provide event title"],
  },
  location: {
    type: String,
    required: [true, "Provide event location"],
  },
  date: {
    type: Date,
    required: [true, "provide date"],
  },
  hostedBy: {
    type: String,
    required: true,
  },
  headlines: {
    type: String,
    required: [true, "Provide headlines for this event"],
  },
  note: {
    type: String,
    default: "",
  },
  image: {
    type: String,
    required: [true, "Please seclect an image for this event"],
  },
  isPublic: {
    type: Boolean,
    default: false,
  },
});

const Award = db.model("Award", awardsSchema);
module.exports = Award;
