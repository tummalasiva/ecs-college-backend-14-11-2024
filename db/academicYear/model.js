const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const moment = require("moment");

const academicYearSchema = new Schema({
  from: {
    type: String,
    required: [true, "provide academic year from"],
  },
  to: {
    type: String,
    required: [true, "provide academic year to"],
  },
  active: {
    type: Boolean,
    default: false,
  },
  note: {
    type: String,
    default: "",
  },
});

academicYearSchema.pre("save", function (next) {
  const doc = this;
  if (!moment(doc.from, "YYYY", true).isValid())
    throw new Error(
      `${doc.from} date error,path: from, provide in "YYYY" format`
    );
  if (!moment(doc.to, "YYYY", true).isValid())
    throw new Error(
      `${doc.to} date error,path: Academic Year To Date, provide in "YYYY" format`
    );
  if (parseInt(doc.to) < parseInt(doc.from))
    throw new Error("Invalid academic year range");
  next();
});

const AcademicYear = db.model("AcademicYear", academicYearSchema);
module.exports = AcademicYear;
