const mongoose = require("mongoose");

require("@db/hostel/model");
require("@db/roomType/model");

const bedSchema = new mongoose.Schema({
  name: {
    type: String,
    trim: true,
    maxLength: 100,
    required: [true, "Please provide bed name"],
  },
  position: {
    type: String,
    trim: true,
    maxLength: 200,
    required: [true, "Please provide bed position"],
  },
  allocated: {
    type: Boolean,
    default: false,
  },
});

const roomSchema = new mongoose.Schema({
  number: {
    type: Number,
    required: [true, "Please provide a room number"],
  },
  type: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "RoomType",
    required: [true, "Please provide a room type"],
  },
  allocatedBeds: {
    type: Number,
    default: 0,
  },
  totalBeds: {
    type: Number,
    required: [true, "Please provide a total number of of beds available"],
  },
  hostel: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Hostel",
    required: [true, "Please provide a hostel"],
  },
  beds: {
    type: [bedSchema],
    default: [],
    required: true,
  },
  note: {
    type: String,
    trim: true,
    maxLength: 200,
  },
});

const Room = db.model("Room", roomSchema);

module.exports = Room;
