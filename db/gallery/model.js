const mongoose = require("mongoose");
const Schema = mongoose.Schema;

require("@db/school/model");

const gallerySchema = new Schema({
  school: {
    type: mongoose.Types.ObjectId,
    ref: "School",
    required: true,
  },
  title: {
    type: String,
    required: [true, "Provide gallery title"],
  },
  date: {
    type: Date,
    required: [true, "Provide gallery date"],
  },
  note: {
    type: String,
    default: "",
  },
  isPublic: {
    type: Boolean,
    default: false,
  },
  images: {
    type: [String],
    default: [],
  },
});

const Gallery = db.model("Gallery", gallerySchema);
module.exports = Gallery;
