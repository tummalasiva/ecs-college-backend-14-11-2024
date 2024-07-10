const mongoose = require("mongoose");
const uuid = require("uuid");

require("@db/school/model");
require("@db/employee/model");
require("@db/subject/model");
require("@db/class/model");

const feedbackSchema = new mongoose.Schema({
  rating: {
    type: Number,
    default: 0,
  },
  comment: {
    type: String,
    default: "",
  },
  givenBy: {
    type: mongoose.Schema.Types.ObjectId,
  },
});

const bulletPointsSchema = new mongoose.Schema({
  point: {
    type: String,
    maxlenght: 200,
  },
});

const courseSchema = new mongoose.Schema({
  school: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "School",
    required: true,
  },
  class: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Class",
      required: true,
    },
  ],
  fallbackClass: [
    {
      type: Object,
      required: true,
    },
  ],

  subject: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Subject",
    required: function () {
      return this.class.length == 1 ? true : false;
    },
  },
  fallbackSubject: {
    type: Object,
    required: function () {
      return this.class.length == 1 ? true : false;
    },
  },
  universalCourse: {
    type: Boolean,
    default: function () {
      return this.class.length > 1 ? false : true;
    },
  },
  material: {
    type: String,
    default: null,
  },
  description: {
    type: String,
    required: true,
  },
  title: {
    type: String,
    required: true,
    index: true,
    maxLength: [300, "Title cannot be more than 300 characters!"],
  },
  courseId: {
    type: String,
    required: true,
    default: uuid.v4,
    index: true,
  },
  courseHours: {
    type: Number,
    default: 0,
  },
  thumbnailImage: {
    type: String,
  },
  courseDetails: {
    overview: {
      type: [bulletPointsSchema],
      default: [],
    },
    benefits: {
      type: [bulletPointsSchema],
      default: [],
    },
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Employee",
    required: true,
  },
  updatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Employee",
    required: true,
    default: function () {
      return this.createdBy;
    },
  },
  isTrending: {
    type: Boolean,
    default: false,
  },
  available: {
    type: Boolean,
    default: true,
  },
  feedbacks: {
    type: [feedbackSchema],
    default: [],
  },
});

courseSchema.indexes(["title", "courseId", "subject"]);

const Course = db.model("Course", courseSchema);

module.exports = Course;
