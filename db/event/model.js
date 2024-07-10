const mongoose = require("mongoose");
const Schema = mongoose.Schema;

require("@db/school/model");

const eventSchema = new mongoose.Schema({
  school: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "School",
    required: true,
  },
  title: {
    type: String,
    required: [true, "Provide event title"],
  },
  eventFor: {
    type: String,
    required: [true, "Provide who can attend this event"],
  },
  location: {
    type: String,
    required: [true, "Provide event location"],
  },
  fromDate: {
    type: Date,
    required: [true, "Provide Event starting date"],
  },
  toDate: {
    type: Date,
    required: [true, "Provide event ending date"],
  },
  hostedBy: {
    type: String,
    default: "",
  },
  shortEvent: {
    type: String,
    required: [true, "Provide short description of event"],
  },
  note: {
    type: String,
    default: "",
  },
  image: {
    type: String,
    required: [true, "Please upload an image related to event"],
  },
  video: {
    type: String,
    default: null,
  },
  isPublic: {
    type: Boolean,
    default: true,
  },
});

const Event = db.model("Event", eventSchema);

module.exports = Event;
