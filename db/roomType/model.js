const mongoose = require("mongoose");

const roomTypeSchema = new mongoose.Schema({
  name: {
    type: String,
    maxLength: 100,
    trim: true,
    required: [true, "Please provide a room name"],
  },

  specification: {
    type: String,
    maxLength: 500,
    trim: true,
    required: [true, "Please provide a valid specification"],
  },
});

const RoomType = db.model("RoomType", roomTypeSchema);

module.exports = RoomType;
