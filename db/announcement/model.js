const mongoose = require("mongoose");

require("@db/student/model");
require("@db/employee/model");
require("@db/department/model");
require("@db/degreeCode/model");
require("@db/semester/model");

const announcementSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, "Provide announcement title"],
  },
  description: {
    type: String,
    required: [true, "Provide announcement description"],
  },
  priority: {
    type: String,
    enum: ["Low", "Medium", "High"],
    default: "Low",
  },
  announcementFor: {
    type: String,
    enum: ["All", "Students", "Faculties", "Parents", "Departments"],
    default: "All",
    required: [true, "Provide announcement scope"],
  },
  degreeCodes: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "DegreeCode",
      required: function () {
        return this.announcementFor === "Students";
      },
    },
  ],
  semester: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Semester",
    required: function () {
      return this.announcementFor === "Students";
    },
  },
  years: [
    {
      type: Number,
      required: function () {
        return this.announcementFor === "Students";
      },
    },
  ],

  faculties: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Employee",
      required: function () {
        return this.announcementFor === "Faculties";
      },
    },
  ],

  parents: [
    {
      type: String,
      required: function () {
        return this.announcementFor === "Parents";
      },
    },
  ],
  departments: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Department",
      required: function () {
        return this.announcementFor === "Departments";
      },
    },
  ],
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Employee",
    required: true,
  },
  departmentOfCreator: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Department",
    required: true,
  },
});

module.exports = db.model("Announcement", announcementSchema);
