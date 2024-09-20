const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const jwt = require("jsonwebtoken");

require("@db/class/model");
require("@db/section/model");
require("@db/academicYear/model");
require("@db/school/model");
require("@db/transport/route/model");
require("@db/transport/stop/model");
require("@db/transport/vehicle/model");
require("@db/hostel/model");
require("@db/room/model");
require("@db/roomType/model");

const randomNumberRange = (min, max) => {
  const random = Math.random();
  return Math.floor(random * (max - min) + min);
};

const motherInfoSchema = new Schema({
  name: {
    type: String,
    default: "",
  },
  contactNumber: {
    type: String,
    default: "",
  },
  education: {
    type: String,
    default: "",
  },
  profession: {
    type: String,
    default: "",
  },
  designation: {
    type: String,
    default: "",
  },
  photo: {
    type: String,
    default: "",
  },
});

const fatherInfoSchema = new Schema({
  name: {
    type: String,
    default: "",
  },
  contactNumber: {
    type: String,
    default: "",
  },
  education: {
    type: String,
    default: "",
  },
  profession: {
    type: String,
    default: "",
  },
  designation: {
    type: String,
    default: "",
  },
  photo: {
    type: String,
    default: "",
  },
});

const basicInfoSchema = new Schema({
  name: {
    type: String,
    required: [true, "Provide student name"],
  },
  admissionDate: {
    type: Date,
    required: [true, "Provide student date"],
  },
  dob: {
    type: Date,
    required: [true, "Provide student date of birth"],
  },
  gender: {
    type: String,
    enum: {
      values: ["male", "female"],
      message:
        '{VALUE} is not a valid value provide either "male,female" for Gender field',
    },
    required: [true, "Provide student gender"],
  },
  bloodGroup: {
    type: String,
    default: "",
  },
  religion: {
    type: String,
    default: "",
  },
  rte: {
    type: String,
    enum: {
      values: ["yes", "no"],
      message:
        "{VALUE} is not valid value provide either 'yes,no' for Rte field",
    },
  },
  caste: {
    type: String,
    default: "",
  },
  cicn: {
    type: String,
    default: "",
  },
  motherTongue: {
    type: String,
    default: "",
  },
  birthPlace: {
    type: String,
    default: "",
  },
  aadharNo: {
    type: String,
    default: "",
  },
  satNo: {
    type: String,
    default: "",
  },
  grNo: {
    type: String,
    default: "",
  },
});

const academicInfoSchema = new Schema({
  degreeCode: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "DegreeCode",
    required: [true, "Provide degree code"],
  },
  section: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Section",
    required: [true, "Provide section"],
  },
  rollNumber: {
    type: Number,
  },
  registrationNumber: {
    type: Number,
    required: true,
  },
});

const otherInfoSchmea = new Schema({
  email: {
    type: String,
    default: "",
  },
  healthCondition: {
    type: String,
    default: "",
  },
  extraInfo: {
    type: String,
    default: "",
  },
  hostelMember: {
    type: Boolean,
    default: false,
  },
  transportMember: {
    type: Boolean,
    default: false,
  },
  busStop: {
    type: String,
    default: "",
  },
  libraryMember: {
    type: Boolean,
    default: false,
  },
});

const contactInfoSchema = new mongoose.Schema({
  guardianName: {
    type: String,
    default: "",
  },
  guardianContactNumber: {
    type: String,
    default: "",
  },
  guardianContactNumberSecondary: {
    type: String,
    default: "",
  },
  guardianRelation: {
    type: String,
    default: "",
  },
  nationId: {
    type: String,
    default: "",
  },
  presentAddress: {
    type: String,
    default: "",
  },
  permanentAddress: {
    type: String,
    default: "",
  },
});

const prevSchInfoSchema = new mongoose.Schema({
  name: {
    type: String,
    default: "",
  },
  tcNo: {
    type: String,
    default: "",
  },
  prevClass: {
    type: String,
    default: "",
  },
  transferCertificate: {
    type: String,
    default: "",
  },
});

const hostelDetailsSchema = new mongoose.Schema({
  name: {
    type: mongoose.Types.ObjectId,
    ref: "Hostel",
  },
  room: {
    type: mongoose.Types.ObjectId,
    ref: "Room",
  },
  bed: {
    type: mongoose.Types.ObjectId,
  },
  roomType: {
    type: mongoose.Types.ObjectId,
    ref: "RoomType",
  },
});

const transportDetailsSchema = new mongoose.Schema({
  route: {
    type: mongoose.Types.ObjectId,
    ref: "Route",
  },
  vehicle: {
    type: mongoose.Types.ObjectId,
    ref: "Vehicle",
  },
  stop: {
    type: mongoose.Types.ObjectId,
    ref: "Stop",
  },
  pickType: {
    type: String,
    enum: {
      values: ["Both", "Pick", "Drop", null],
      message:
        "Please mention a valid transport pick type! Both || Pick || Drop",
    },
  },
});

const studentSchema = new mongoose.Schema({
  school: {
    type: mongoose.Types.ObjectId,
    ref: "School",
    required: true,
  },
  registrationYear: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "AcademicYear",
    required: true,
  },
  basicInfo: {
    type: basicInfoSchema,
  },
  contactInfo: {
    type: contactInfoSchema,
  },
  prevSchInfo: {
    type: prevSchInfoSchema,
  },
  fatherInfo: {
    type: fatherInfoSchema,
  },
  motherInfo: {
    type: motherInfoSchema,
  },
  otherInfo: {
    type: otherInfoSchmea,
  },
  academicInfo: {
    type: academicInfoSchema,
  },
  hostelInfo: {
    type: hostelDetailsSchema,
  },
  transportInfo: {
    type: transportDetailsSchema,
  },
  photo: {
    type: String,
    default: "",
  },
  academicYear: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "AcademicYear",
    required: [true, "Provide academic year"],
  },
  contactNumber: {
    type: Number,
    required: [true, "Provide contact number"],
  },
  active: {
    type: Boolean,
    default: true,
  },
  username: {
    type: String,
    required: [true, "Please provide username"],
  },
  password: {
    type: String,
    required: [true, "Please provide password"],
  },
  expoPushToken: {
    type: String,
    default: null,
  },
  authToken: {
    type: String,
    default: null,
    select: false,
  },
  verificationOtp: {
    type: Number,
    default: null,
  },
  otpExpiry: {
    type: Date,
    default: null,
  },
  userType: {
    type: String,
    enum: ["student", "alumni", "guardian"],
    default: "student",
  },
});

studentSchema.pre("save", function (next) {
  const student = this;
  student.username = `${process.env.USERNAME_SUCCESSOR}_${randomNumberRange(
    10000000,
    99999999
  )}`;
  student.password = student.contactNumber;
  next();
});

studentSchema.methods.generateAuthToken = async function () {
  const student = this;
  const token = jwt.sign(
    {
      _id: student._id.toString(),
      schoolId: student.school?._id.toString(),
      userType: "student",
    },
    process.env.JWT_PRIVATE_KEY,
    {
      expiresIn: 900,
    }
  );
  return token;
};

studentSchema.methods.generatePermanentAuthToken = async function () {
  const student = this;
  const token = jwt.sign(
    {
      _id: student._id.toString(),
      userType: "student",
      schoolId: student.school?._id.toString(),
    },
    process.env.JWT_PRIVATE_KEY
  );
  return token;
};

const Student = db.model("Student", studentSchema);
module.exports = Student;
