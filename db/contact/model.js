const mongoose = require("mongoose");

const contactSchema = new mongoose.Schema({
  queryType: {
    type: String,
    required: true,
  },

  contactPerson: {
    type: String,
    required: true,
  },
  contactNumbers: [
    {
      type: String,
    },
  ],
  contactEmails: [
    {
      type: String,
      required: true,
    },
  ],
  enabled: {
    type: Boolean,
    default: true,
  },
});

module.exports = db.model("Contact", contactSchema);
