const mongoose = require("mongoose");

const offeredSubjectSchema = new mongoose.Schema({
  subject: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Subject",
    required: true,
  },
  semester: {},
  academicYear: {},
});
