const mongoose = require("mongoose");

const VALID_ROOM_TYPES = [
  "Lecture Hall",
  "Computer Lab",
  "Faculty Office",
  "Seminar Hall",
  "Library",
  "Workshop",
  "Laboratory",
  "Dormitory",
  "Warden's Office",
  "Reading Hall",
  "Reference Section",
  "E-Library",
  "Archives",
  "Conference Room",
  "Librarian's Office",
  "Dean's Office",
  "Admission Office",
  "Accounts Office",
  "Meeting Room",
  "Human Resources",
  "Registrar's Office",
];

const buildingRoomSchema = new mongoose.Schema({
  building: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Building",
    required: true,
  },
  roomNumber: {
    type: String,
    required: true,
  },
  roomType: {
    type: String,
    enum: VALID_ROOM_TYPES,
    required: true,
  },
  capacity: {
    type: Number,
    required: true,
  },
  available: {
    type: Boolean,
    default: false,
  },
  isExamHall: {
    type: Boolean,
    default: false,
  },
});

module.exports = db.model("BuildingRoom", buildingRoomSchema);
