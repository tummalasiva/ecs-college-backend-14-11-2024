const mongoose = require("mongoose");

const degreeCodeSchema = new mongoose.Schema({
  degree: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Degree",
    required: true,
  },
  specialization: {
    type: String,
    required: true,
  },
  degreeCode: {
    type: String,
    required: true,
  },
});

module.exports = db.model("DegreeCode", degreeCodeSchema);
