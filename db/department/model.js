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
  code: {
    type: String,
    required: [true, "Provide department code"],
  },
});

const Department = db.model("Department", departmentSchema);
module.exports = Department;
