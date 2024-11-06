const mongoose = require("mongoose");
const { hashing } = require("../../helper/helpers");
const jwt = require("jsonwebtoken");

const guardianSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    maxLength: 200,
  },
  contactNumber: {
    type: String,
    required: true,
    minLength: 10,
    maxLength: 15,
  },
  wardRegistrationNumber: {
    type: String,
    required: true,
  },
  username: {
    type: String,
    required: true,
    unique: true,
    maxLength: 100,
  },
  plainPassword: {
    type: String,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
  userType: {
    type: String,
    required: true,
    default: "parent",
  },
  active: {
    type: Boolean,
    default: true,
  },
});

// Middleware to hash password before saving

// Method to generate authentication token
guardianSchema.methods.generateAuthToken = async function () {
  const token = jwt.sign(
    {
      _id: this._id.toString(),
      userType: this.userType,
      registrationNumber: this.wardRegistrationNumber,
    },
    process.env.JWT_PRIVATE_KEY
  );
  return token;
};

module.exports = db.model("Guardian", guardianSchema);
