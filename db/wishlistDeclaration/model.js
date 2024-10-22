const mongoose = require("mongoose");

require("@db/semester/model");
require("@db/department/model");
require("@db/subjectCategory/model");

const wishlistDeclarationSchema = new mongoose.Schema({
  semester: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Semester",
    required: true,
  },
  maximumCreditsAllowed: {
    type: Number,
    required: true,
  },
  department: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Department",
    required: true,
  },
  wishlistStartDate: {
    type: Date,
    required: true,
  },
  wishlistEndDate: {
    type: Date,
    required: true,
  },
  registrationStartDate: {
    type: Date,
    required: true,
  },
  registrationEndDate: {
    type: Date,
    required: true,
  },
  status: {
    type: String,
    enum: [
      "wishlist_open",
      "wishlist_closed",
      "registration_open",
      "registration_closed",
    ],
    default: "wishlist_closed",
  },
  notifications: [
    {
      message: {
        type: String,
        required: true,
      },
      date: {
        type: Date,
        default: Date.now,
      },
    },
  ],

  subjectCategories: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "SubjectCategory",
      required: true,
    },
  ],
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Employee",
    required: true,
  },
});

module.exports = db.model("WishlistDeclaration", wishlistDeclarationSchema);
