const mongoose = require("mongoose");

const breakupSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Please provide breakup name"],
  },
  percentage: {
    type: Number,
    required: [true, "Please provide breakup percentage"],
  },
});

const deductionSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Please provide deduction name"],
  },
  percentage: {
    type: Number,
    required: [true, "Please provide deduction percentage"],
  },
});

const salaryGradeSchema = new mongoose.Schema({
  gradeCode: {
    type: String,
    required: [true, "Please provide grade code"],
  },
  grade: {
    type: String,
    required: [true, "Please provide grade"],
  },
  from: {
    type: Number,
    required: [true, "Please provide from"],
  },
  to: {
    type: Number,
    required: [true, "Please provide to"],
  },
  breakups: [breakupSchema],
  deduction: [deductionSchema],
  active: {
    type: Boolean,

    default: true,
  },
});
const SalaryGrade = db.model("SalaryGrade", salaryGradeSchema);

module.exports = SalaryGrade;
