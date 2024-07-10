const mongoose = require("mongoose");

require("@db/school/model");

const bookSchema = new mongoose.Schema({
  school: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "School",
    required: true,
  },
  title: {
    type: String,
    required: [true, "Provide book title"],
  },
  id: {
    type: String,
    required: [true, "Provide books id"],
  },
  department: {
    type: String,
    required: [true, "Provide book department"],
  },
  cellNumber: {
    type: Number,
    required: [true, "Provide cell number"],
  },
  isbnNo: {
    type: String,
    default: "",
  },
  edison: {
    type: String,
    default: "",
  },
  author: {
    type: String,
    default: "",
  },
  language: {
    type: String,
    default: "",
  },
  price: {
    type: Number,
    default: null,
  },
  quantity: {
    type: Number,
    required: [true, "Provide book quantity"],
  },
  leftInStock: {
    type: Number,
    default: function () {
      return this.quantity;
    },
  },
  almiraNo: {
    type: String,
    default: "",
  },
  bookCover: {
    type: String,
    default: "",
  },
});

const Book = db.model("Book", bookSchema);

module.exports = Book;
