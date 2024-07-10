const mongoose = require("mongoose");

const splashNewsSchema = new mongoose.Schema({
  school: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "School",
    required: true,
  },
  contentType: {
    type: String,
    enum: {
      values: ["Link", "Text", "Image", "Document"],
      message: "Please mention a valid content type!",
    },
    required: function () {
      this.type === "Popup"
        ? [true, "Please mention a valid content type!"]
        : false;
    },
  },
  title: {
    type: String,
    default: "",
  },
  link: {
    type: String,
    required: function () {
      return this.contentType === "Link" ? true : false;
    },
  },
  image: {
    type: String,
    required: function () {
      return this.contentType === "Image" ? true : false;
    },
  },
  text: {
    type: String,
    default: "",
  },
  document: {
    type: String,
    required: function () {
      return this.contentType === "Document" ? true : false;
    },
  },
  type: {
    type: String,
    enum: {
      values: ["Horizontal", "Popup"],
      message: "Please select a valid type Horizontal | Popup",
    },
    default: "Horizontal",
  },
  createdBy: {
    type: mongoose.Types.ObjectId,
    ref: "Employee",
  },
  enabled: {
    type: Boolean,
    default: false,
  },
});

const SplashNews = db.model("SplashNews", splashNewsSchema);
//
module.exports = SplashNews;
