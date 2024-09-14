const mongoose = require("mongoose");

require("@db/employee/model");

const taskSchema = new mongoose.Schema({
  school: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "School",
    required: true,
  },
  title: {
    type: String,
    required: [true, "Task must have a title"],
  },
  assignedTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Employee",
    required: [true, "Task must be assigned to an employee"],
  },
  dueDate: {
    type: Date,
    required: [true, "Task must have a due date"],
  },
  priority: {
    type: String,
    enum: ["High", "Medium", "Low"],
    default: "Medium",
  },
  status: {
    type: String,
    enum: ["Pending", "In Progress", "Completed"],
    default: "Pending",
  },
  description: {
    type: String,
    default: "",
  },
  files: {
    type: [String],
    default: [],
  },
});

module.exports = db.model("Task", taskSchema);
