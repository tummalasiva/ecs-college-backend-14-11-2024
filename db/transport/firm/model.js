const mongoose = require("mongoose");

const firmSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Please provide firm name"],
  },
  contactNumber: {
    type: String,
    required: [true, "Please provide contact number"],
  },
  email: {
    type: String,
  },
  GSTNumber: {
    type: String,
  },
  website: {
    type: String,
  },
  address: {
    type: String,
  },
  city: {
    type: String,
  },
  state: {
    type: String,
  },
  zipCode: {
    type: String,
  },
});
const Firm = db.model("Firm", firmSchema);

module.exports = Firm;
