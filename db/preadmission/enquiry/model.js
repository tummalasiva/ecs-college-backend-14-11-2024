const mongoose = require("mongoose");

require("@db/school/model");
require("@db/class/model");
require("@db/academicYear/model");
require("@db/preadmission/examSchedule/model");

function generateRandom6DigitNumber() {
  // Generate a random number between 100000 (inclusive) and 999999 (inclusive)
  const randomNumber =
    Math.floor(Math.random() * (999999 - 100000 + 1)) + 100000;

  return randomNumber;
}

const basicDetailsSchema = new mongoose.Schema({
  name: { type: String, required: true },
  dob: Date,
  gender: {
    type: String,
    enum: {
      values: ["male", "female"],
      message: "Please provide a valid gender",
    },
    required: true,
  },
  bloodGroup: {
    type: String,
    default: null,
  },
  caste: {
    type: String,
    default: null,
  },
  casteIncomeCertificateNumber: {
    type: String,
    default: null,
  },
  motherTongue: {
    type: String,
    default: null,
  },
  birthPlace: {
    type: String,
    default: null,
  },
  aadharNumber: {
    type: String,
    default: null,
  },
});

const contactSchema = new mongoose.Schema({
  contactNumber: {
    type: Number,
    required: true,
  },
  guardianName: {
    type: String,
    required: true,
  },
  guardianContactNumber: {
    type: Number,
    required: true,
  },
  alternateNumber: {
    type: Number,
    default: null,
  },
  relationWithGuardian: {
    type: String,
    default: null,
  },
  nationalId: {
    type: String,
    default: null,
  },
  presentAddress: {
    type: String,
    default: null,
  },
  permanentAddress: {
    type: String,
    default: null,
  },
});

const academicInfoSchema = new mongoose.Schema({
  class: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: "Class",
  },
  academicYear: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: "AcademicYear",
  },
});

const previousSchoolInfoSchema = new mongoose.Schema({
  schoolName: {
    type: String,
    default: null,
  },
  class: {
    type: String,
    default: null,
  },
  tcNumber: {
    type: String,
    default: null,
  },
});

const fatherInfoSchema = new mongoose.Schema({
  name: {
    type: String,
    default: null,
  },
  contactNumber: {
    type: Number,
    default: null,
  },
  profession: {
    type: String,
    default: null,
  },
  education: {
    type: String,
    default: null,
  },
  designation: {
    type: String,
    default: null,
  },
});

const montherInfoSchema = new mongoose.Schema({
  name: {
    type: String,
    default: null,
  },
  contactNumber: {
    type: Number,
    default: null,
  },
  profession: {
    type: String,
    default: null,
  },
  education: {
    type: String,
    default: null,
  },
  designation: {
    type: String,
    default: null,
  },
});

const otherInfoSchema = new mongoose.Schema({
  email: {
    type: String,
    default: null,
  },
  healthCondition: {
    type: String,
    default: null,
  },
  hostelRequired: {
    type: String,
    enum: {
      values: ["yes", "no"],
      message: "Please select a valid hostel requirement option",
    },
    default: "no",
  },
  transportRequired: {
    type: String,
    enum: {
      values: ["yes", "no"],
      message: "Please select a valid transport requirement option",
    },
    default: "no",
  },
});

const studentDetailsSchema = new mongoose.Schema({
  basicDetails: basicDetailsSchema,
  contactDetails: contactSchema,
  academicDetails: academicInfoSchema,
  previousSchoolDetails: previousSchoolInfoSchema,
  fatherDetails: fatherInfoSchema,
  motherDetails: montherInfoSchema,
  otherDetails: otherInfoSchema,
});

const enquirySchema = new mongoose.Schema({
  admittedStudentId: {
    type: mongoose.Schema.Types.ObjectId,
    default: null,
  },
  school: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "School",
    required: true,
  },
  enquiryId: {
    type: String,
    default: function () {
      return `${generateRandom6DigitNumber()}`;
    },
    required: true,
  },
  studentDetails: {
    type: studentDetailsSchema,
    required: true,
  },
  studentName: {
    type: String,
    required: true,
  },
  contactNumber: {
    type: Number,
    required: true,
  },
  status: {
    type: String,
    enum: {
      values: ["Approved", "Rejected", "Pending", "Shortlisted", "Admitted"],
      message: "Please mention a valid enquiry status!",
    },
    default: "Pending",
  },
  examScheduled: {
    type: Boolean,
    default: false,
  },
  examSchedule: {
    type: mongoose.Schema.Types.ObjectId,
    default: null,
    ref: "PreAdmissionExamSchedule",
  },
  notified: {
    type: Boolean,
    default: false,
  },
  examConducted: {
    type: Boolean,
    default: false,
  },
  examTakenDetails: {
    type: Object,
    default: null,
  },
});

const PreAdmissionEnquiry = db.model("PreAdmissionEnquiry", enquirySchema);

module.exports = PreAdmissionEnquiry;
