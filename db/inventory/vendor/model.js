const mongoose = require("mongoose");

require("@db/school/model");
require("@db/employee/model");

const basicInfoSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    maxLength: [200, "Name cannot be more than 200 characters"],
    trim: true,
    index: true,
  },

  category: {
    type: String,
    trim: true,
    default: "",
    maxLength: [200, "Category cannot be more than 200 characters."],
  },
  phone: {
    type: Number,
    max: 9999999999,
    min: 1000000000,
    required: true,
  },
  email: {
    type: String,
    required: true,
    trim: true,
    maxLength: [200, "Email cannot be more than 200 characters"],
  },
  gstNumber: {
    type: String,
    required: true,
    trim: true,
    maxLength: [15, "Invalid Gst number"],
    minLength: [15, "Invalid Gst number"],
  },
  website: {
    type: String,
    maxLength: [200, "Email cannot be more than 200 characters"],
  },
  dealerName: {
    type: String,
    maxLength: [200, "Dealer name cannot be more than 200 characters"],
    trim: true,
  },
  dealerPhoneNumber: {
    type: Number,
    max: 9999999999,
    min: 1000000000,
  },
});

const addressSchema = new mongoose.Schema({
  address: {
    type: String,
    trim: true,
    maxLength: [500, "Address cannot be more than 500 characters"],
    required: true,
  },
  state: {
    type: String,
    maxLength: [200, "Invalid state name"],
    required: true,
    trim: true,
  },
  city: {
    type: String,
    maxLength: [200, "Invalid city name"],
    required: true,
    trim: true,
  },
  zipCode: {
    type: Number,
    max: 999999,
    min: 100000,
    required: true,
  },
});

const bankInfoSchema = new mongoose.Schema({
  bankName: {
    type: String,
    default: "",
    maxLength: [200, "Bank cannot be more than 200 characters"],
    trim: true,
  },
  accountNumber: {
    default: "",
    type: String,
    maxLength: [200, "Bank account number cannot be more than 200 characters"],
    trim: true,
  },
  ifscCode: {
    default: "",
    type: String,
    maxLength: [200, "IFSC code cannot be more than 200 characters"],
    trim: true,
  },
  branchName: {
    type: String,
    rdefault: "",
    maxLength: [200, "Branch name cannot be more than 200 characters"],
    trim: true,
  },
});

const vendorSchema = new mongoose.Schema({
  school: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "School",
    required: true,
  },
  photo: {
    type: String,
    default: "",
  },
  basicInfo: basicInfoSchema,
  addressInfo: addressSchema,
  bankInfo: bankInfoSchema,
  addedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Employee",
    required: true,
  },
});

vendorSchema.indexes(["basicInfo.name"]);

const Vendor = db.model("Vendor", vendorSchema);

module.exports = Vendor;
