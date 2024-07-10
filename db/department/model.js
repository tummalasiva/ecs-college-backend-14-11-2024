const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const departmentSchema = new Schema({
  orderSequence: {
    type: Number,
    required: true,
  },
  name: {
    type: String,
    required: [true, "Provide department name"],
  },
  note: {
    type: String,
    default: "",
  },
});

const Department = db.model("Department", departmentSchema);
module.exports = Department;
