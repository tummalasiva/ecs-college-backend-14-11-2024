const mongoose = require("mongoose");
const Schema = mongoose.Schema;

require("@db/school/model");
require("@db/employee/model");

const classSchema = new Schema({
  school: {
    type: mongoose.Types.ObjectId,
    ref: "School",
    required: true,
  },

  name: {
    type: String,
    required: [true, "provide className"],
  },
  numericName: {
    type: Number,
  },
  orderSequence: {
    type: Number,
    required: true,
  },
  classTeachers: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Employee",
    },
  ],
  note: {
    type: String,
    default: "",
  },
  active: {
    type: Boolean,
    required: true,
  },
  isPublic: {
    type: Boolean,
    default: false,
  },
});

const Class = db.model("Class", classSchema);
module.exports = Class;
