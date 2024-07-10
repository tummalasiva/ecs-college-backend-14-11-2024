const mongoose = require("mongoose");

const periodicalSchema = new mongoose.Schema({
  school: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "School",
    required: true,
  },
  title: {
    type: String,
    required: [true, "Provide periodical title"],
  },
  type: {
    type: String,
    required: [true, "Provide books type"],
    enum: ["journal", "magazine", "newspaper"],
  },
  department: {
    type: String,
    required: [true, "Provide book department"],
  },
  issueNumber: {
    type: Number,
    required: [true, "Provide book issueNumber"],
  },
  volumeNumber: {
    type: Number,
    default: null,
  },
  quantity: {
    type: Number,
    required: [true, "Provide quantity"],
  },
  price: {
    type: Number,
    default: null,
  },
  bookCover: {
    type: String,
    default: "",
  },
  entryDate: {
    type: Date,
    required: [true, "Provide entry date"],
  },
});

const Periodical = db.model("Periodical", periodicalSchema);
module.exports = Periodical;
