// Dependencies
const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const roleSchema = new Schema({
  orderSequence: {
    type: Number,
    default: 0,
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
  permissions: [
    {
      module: String,
      permissions: { type: Array, default: [] },
    },
  ],
  note: {
    type: String,
    default: "",
  },
});

const Role = db.model("Role", roleSchema);

module.exports = Role;
