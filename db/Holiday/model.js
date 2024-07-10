const { ObjectID } = require("bson");
const mongoose = require("mongoose");
const Schema = mongoose.Schema;

require("@db/school/model");

const holidaySchema = new Schema({
  school: {
    type: Schema.Types.ObjectId,
    required: true,
    ref: "School",
  },
  title: {
    type: String,
    required: [true, "Provide title"],
  },
  fromDate: {
    type: Date,
    required: [true, "Provide from date"],
  },
  toDate: {
    type: Date,
    required: [true, "Provide to date"],
  },
  note: {
    type: String,
    default: "",
  },
  isPublic: {
    type: Boolean,
    required: [true, "Mention if it can seen on the website"],
    default: false,
  },
});

const Holiday = db.model("Holiday", holidaySchema);
module.exports = Holiday;
