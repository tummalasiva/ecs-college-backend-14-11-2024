const { ObjectID } = require("bson");
const mongoose = require("mongoose");
const Schema = mongoose.Schema;

require("@db/school/model");

const newsSchema = new Schema({
  school: {
    type: Schema.Types.ObjectId,
    ref: "School",
    required: true,
  },
  title: {
    type: String,
    required: [true, "Provide title for news"],
  },
  date: {
    type: Date,
    required: [true, "Provide date"],
  },
  image: {
    type: String,
    default: "",
  },
  shortNews: {
    type: String,
    required: [true, "Provide headlines/short news"],
  },
  news: {
    type: String,
    required: [true, "Provide the news content"],
  },
  isPublic: {
    type: Boolean,
    required: [true, "Mention if it can be seen on website!"],
  },
  additionalFile: {
    type: [String],
    default: [],
  },
});

const News = db.model("News", newsSchema);
module.exports = News;
