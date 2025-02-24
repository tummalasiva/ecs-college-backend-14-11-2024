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

require("@db/building/model");
require("@db/department/model");

const buildingRoomSchema = new mongoose.Schema({
  building: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Building",
    required: true,
  },
  department: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Department",
    required: true,
  },

  // any department can use this room for class/exams etc
  sharedRoom: {
    type: Boolean,
    default: false,
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
  isAcRoom: {
    type: Boolean,
    default: false,
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
  numberOfRows: {
    type: Number,
    required: function () {
      return this.isExamHall ? true : false;
    },
  },
  numberOfColumns: {
    type: Number,
    required: function () {
      return this.isExamHall ? true : false;
    },
  },
});

module.exports = db.model("BuildingRoom", buildingRoomSchema);
