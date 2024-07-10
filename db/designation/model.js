const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const designationSchema = new Schema({
  orderSequence: {
    type: Number,
    required: true,
  },
  name: {
    type: String,
    unique: true,
    required: [true, "Provide designation name"],
  },
  note: {
    type: String,
    default: "",
  },
});

const Designation = db.model("Designation", designationSchema);
module.exports = Designation;
