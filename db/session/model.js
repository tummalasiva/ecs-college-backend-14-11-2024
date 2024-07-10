const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const sessionsSchema = new Schema({
  name: {
    type: String,
    required: [true, "Provide session name"],
  },
  duration: {
    type: Number,
    required: [true, "Provide session duration"],
  },
});

const sessionSchema = new Schema({
  school: {
    type: Schema.Types.ObjectId,
    ref: "School",
    required: true,
  },
  sessions: {
    type: [sessionsSchema],
    required: true,
  },
});

const SchoolSession = db.model("SchoolSession", sessionSchema);
module.exports = SchoolSession;
