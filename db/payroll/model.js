const mongoose = require("mongoose");

const payrollSchema = new mongoose.Schema({
  attendance: {
    leave: {
      type: Number,
    },
    month: {
      type: String,
    },
    workedDays: {
      type: Number,
    },
    workingDaysInMonth: {
      type: Number,
    },
  },
  salary: {
    grade: {
      type: String,
    },
    annualSalary: {
      type: Number,
    },
    deduction: {
      type: String,
    },
  },
  status: {
    type: String,
    default: "active",
  },
});
const Payroll = db.model("Payroll", payrollSchema);

module.exports.Payroll = Payroll;
