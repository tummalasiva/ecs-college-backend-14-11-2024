const mongoose = require("mongoose");

const codeOfConductSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    maxLength: 100,
  },
  description: {
    type: String,
    required: true,
    maxLength: 1000,
  },
});

module.exports = db.model("CodeOfConduct", codeOfConductSchema);
