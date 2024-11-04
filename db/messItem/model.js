const mongoose = require("mongoose");

const messItemSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    maxLength: 100,
  },
  price: {
    type: Number,
  },
  quantity: {
    type: String,
  },
  description: {
    type: String,
    maxLength: 1000,
  },
  benefits: {
    type: String,
    maxLength: 1000,
  },
});

module.exports = db.model("MessItem", messItemSchema);
