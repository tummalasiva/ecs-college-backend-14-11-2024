const { ObjectID } = require("bson");
const mongoose = require("mongoose");
const Schema = mongoose.Schema;

require("@db/school/model");

const noticeSchema = new Schema({
  school: {
    type: Schema.Types.ObjectId,
    required: true,
    ref: "School",
  },
  title: {
    type: String,
    required: [true, "Provide title"],
  },
  date: {
    type: Date,
    required: [true, "Provide date"],
  },
  noticeFor: {
    type: String,
    required: [true, "Provide notice for"],
  },
  notice: {
    type: String,
    required: [true, "Provide notice"],
  },
  isPublic: {
    type: Boolean,
    required: [true, "Mention if this can been seen on the website"],
    default: false,
  },
});

const Notice = db.model("Notice", noticeSchema);
module.exports = Notice;
