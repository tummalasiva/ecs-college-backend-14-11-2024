const mongoose = require("mongoose");

const invigSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    maxLength: 200,
  },
  description: {
    type: String,
    required: true,
    maxLength: 1000,
  },
});

module.exports = db.model("InvigilatorRole", invigSchema);
