const mongoose = require("mongoose");

const storageSchema = new mongoose.Schema({
  totalFilesUploaded: {
    type: Number,
    default: 0,
  },
  totalFilesDeleted: {
    type: Number,
    default: 0,
  },
  totalStorage: {
    type: Number,
    default: 5153960755.968,
  },
  usedStorage: {
    type: Number,
    default: 0,
  },
});

const Storage = db.model("Storage", storageSchema);

module.exports = Storage;
