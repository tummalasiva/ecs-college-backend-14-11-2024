const mongoose = require("mongoose");

const letterPdfSchema = new mongoose.Schema({
  letterName: {
    type: String,
    required: [true, "provide name"],
  },
  options: {
    imgPostion: {
      type: String,
      enum: ["left", "right", "center"],
      required: [true, "provide imgPostion"],
    },
    signPostion: {
      type: String,
      enum: ["left", "center", "right"],
      required: [true, "provide signPostion"],
    },
    subjectPosition: {
      type: String,
      enum: ["left", "center", "right"],
      required: [true, "provide subjectPostion"],
    },
    datePostion: {
      type: String,
      enum: ["left", "center", "right"],
      required: [true, "provide subjectPostion"],
    },
    receiver: {
      type: String,
      enum: ["left", "center", "right"],
      required: [true, "provide subjectPostion"],
    },
  },
  data: {
    date: {
      type: Date,
      required: [true, "provide date"],
    },
    subject: {
      type: String,
      required: [true, "provide name"],
    },
    bodyTitle: {
      type: String,
      required: [true, "provide name"],
    },
    body: {
      type: String,
      required: [true, "provide name"],
    },
    signImg: {
      data: {
        type: Buffer,
      },
      mimeType: {
        type: String,
      },
    },
    logo: {
      data: {
        type: Buffer,
      },
      mimeType: {
        type: String,
      },
    },
    companyName: {
      type: String,
      required: [true, "provide name"],
    },
    signRemarks: {
      type: String,
      required: [true, "provide name"],
    },
    signForm: {
      type: String,
      required: [true, "provide name"],
    },
  },
});

module.exports = db.model("LetterPdf", letterPdfSchema);
