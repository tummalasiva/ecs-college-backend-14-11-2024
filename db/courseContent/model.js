const mongoose = require("mongoose");

require("@db/course/model");

const optionSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    maxLength: 1000,
  },
});

const quizSchema = new mongoose.Schema({
  question: {
    type: String,
    required: true,
    maxLength: 1000,
  },
  options: {
    type: [optionSchema],
    required: true,
  },
  correctOption: {
    type: String,
    required: true,
  },
});

const flashCardSchema = new mongoose.Schema({
  cardType: {
    type: String,
  },
  text: {
    type: String,
    required: function () {
      return this.cardType === "Text" ? true : false;
    },
  },
  image: {
    type: String,
    required: function () {
      return this.cardType === "Image" ? true : false;
    },
  },
});

const chapterSchema = new mongoose.Schema({
  title: {
    type: String,
    default: "",
  },
  description: {
    type: String,
    default: "",
  },
  orderSequence: {
    type: Number,
  },
  material: {
    type: String,
    default: null,
  },
  contents: [
    {
      title: {
        type: String,
        default: "",
      },
      description: {
        type: String,
        default: "",
      },
      contentHours: {
        type: Number,
        required: true,
      },
      type: {
        type: String, // can be Quiz, Video, FlashCard, Material
        required: true,
      },
      orderSequence: {
        type: Number,
      },
      quiz: {
        type: [quizSchema],
      },
      video: {
        type: String,
      },
      flashCard: {
        type: flashCardSchema,
      },
      contentMaterial: {
        type: String,
      },
    },
  ],
});

const courseContentSchema = new mongoose.Schema({
  courseId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Course",
    required: true,
    index: true,
  },
  chapters: {
    type: [chapterSchema],
  },
});

courseContentSchema.indexes(["courseId"]);

const CourseContent = db.model("CourseContent", courseContentSchema);

module.exports = CourseContent;
