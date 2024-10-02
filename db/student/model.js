const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const jwt = require("jsonwebtoken");

require("@db/section/model");
require("@db/academicYear/model");
require("@db/school/model");
require("@db/transport/route/model");
require("@db/transport/stop/model");
require("@db/transport/vehicle/model");
require("@db/hostel/model");
require("@db/buildingRoom/model");
require("@db/degreeCode/model");
require("@db/employee/model");
require("@db/subject/model");
require("@db/semester/model");

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
  country: {
    type: String,
    default: "",
  },
  state: {
    type: String,
    default: "",
  },
  city: {
    type: String,
    default: "",
  },
  languages: {
    type: [String],
    default: [],
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
  section: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Section",
      required: [true, "Provide section"],
    },
  ],
  semester: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Semester",
    required: [true, "Provide semester"],
  },
  registrationNumber: {
    type: String,
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

const hostelDetailsSchema = new mongoose.Schema({
  room: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "BuildingRoom",
  },
});

const transportDetailsSchema = new mongoose.Schema({
  route: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Route",
  },
  vehicle: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Vehicle",
  },
  stop: {
    type: mongoose.Schema.Types.ObjectId,
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

const registeredSubjectsSchema = new mongoose.Schema({
  subject: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Subject",
  },
});

const studentSchema = new mongoose.Schema({
  school: {
    type: mongoose.Schema.Types.ObjectId,
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
    unique: true,
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
    enum: ["student", "alumni"],
    default: "student",
  },
  mentor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Employee",
  },
  bankDetails: {},
  eligibleForExam: {
    type: Boolean,
    default: true,
  },
  registeredSubjects: [registeredSubjectsSchema],
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
      userType: student.userType,
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
      userType: student.userType,
      schoolId: student.school?._id.toString(),
    },
    process.env.JWT_PRIVATE_KEY
  );
  return token;
};

const Student = db.model("Student", studentSchema);
module.exports = Student;
