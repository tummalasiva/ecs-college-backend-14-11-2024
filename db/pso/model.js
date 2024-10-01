const mongoose = require("mongoose");

const psoSchema = new mongoose.Schema({
  degreeCode: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "DegreeCode",
    required: true,
  },
  psoId: {
    type: String,
    required: true,
    maxLength: 200,
  },
  description: {
    type: String,
    required: true,
    maxLength: 2000,
  },
});

module.exports = db.model("Pso", psoSchema);
