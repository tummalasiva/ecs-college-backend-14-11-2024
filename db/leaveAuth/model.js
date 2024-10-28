const mongoose = require("mongoose");

require("@db/employee/model");

const leaveAuthSchema = new mongoose.Schema({
  employees: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Employee",
      required: true,
    },
  ],
  canBeApprovedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Employee",
    required: true,
  },
});

module.exports = db.model("LeaveAuth", leaveAuthSchema);
