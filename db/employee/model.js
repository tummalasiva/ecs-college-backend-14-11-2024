const mongoose = require("mongoose");
const mongooseLeanGetter = require("mongoose-lean-getters");
const { hashing, hashVerfiy } = require("../../helper/helpers");
const jwt = require("jsonwebtoken");
const Designation = require("../designation/model");
const Department = require("../department/model");
const School = require("../school/model");
const SalaryGrade = require("../salaryGrade/model");
const Role = require("../role/model");

const basicInfoSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Provide employee name"],
  },
  empId: {
    type: String,
    required: true,
  },
  responsibility: {
    type: String,
    default: "",
  },
  designation: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Designation",
    required: [true, "Provide designation"],
  },
  fallbackDesignation: {
    type: Object,
    required: true,
  },
  secMobileNo: {
    type: String,
    default: "",
  },
  gender: {
    type: String,
    enum: ["male", "female"],
    required: [true, "Provide gender"],
  },
  bloodGroup: {
    type: String,
    default: "",
  },
  religion: {
    type: String,
    default: "",
  },
  dob: {
    type: Date,
    required: [true, "Provide birth date"],
  },
  presentAddress: {
    type: String,
    default: "",
  },
  permanentAddress: {
    type: String,
    default: "",
  },
  fatherName: {
    type: String,
    default: "",
  },
  spouseName: {
    type: String,
    default: "",
  },
  aadharNo: {
    type: String,
    default: "",
  },
  fatherOccupation: {
    type: String,
    default: "",
  },
  spouseOccupation: {
    type: String,
    default: "",
  },
});

const academicInfoSchema = new mongoose.Schema({
  qualification: {
    type: String,
    default: "",
    // required: true,
  },
  workExperience: {
    type: String,
    default: "",
  },
  email: {
    type: String,
    required: true,
  },
  salaryGrade: {
    type: mongoose.Types.ObjectId,
    ref: "SalaryGrade",
    // required: true,
    default: null,
  },
  fallbackSalaryGrade: {
    type: Object,
    default: null,
  },
  salaryType: {
    type: String,
    enum: ["monthly", "hourly"],
    required: true,
    default: "monthly",
  },
  department: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Department",
    required: [true, "Provide department"],
  },
  fallbackDepartment: {
    type: Object,
    required: true,
  },
  joiningDate: {
    type: Date,
    required: [true, "Provide joining date"],
  },
  resume: {
    type: String,
    default: "",
  },
});

const otherInfoSchema = new mongoose.Schema({
  facebookUrl: {
    type: String,
    default: null,
  },
  twitterUrl: {
    type: String,
    default: null,
  },
  linkedinUrl: {
    type: String,
    default: null,
  },
  googlePlusUrl: {
    type: String,
    default: null,
  },
  youtubeUrl: {
    type: String,
    default: null,
  },
  instagramUrl: {
    type: String,
    default: null,
  },
  pinterestUrl: {
    type: String,
    default: null,
  },
  public: {
    type: Boolean,

    default: false,
  },
  showDetailsForWeb: {
    type: Boolean,
    default: false,
  },
  detailsForWeb: {
    photo: {
      type: String,
      default: "",
    },
    otherInfo: {
      type: Object,
      default: null,
    },
  },
});

const employeeSchema = new mongoose.Schema({
  currentLeaveCredits: {
    type: Array,
    default: [],
  },
  school: {
    type: mongoose.Types.ObjectId,
    ref: "School",
    required: true,
  },

  expoPushToken: {
    type: String,
    default: null,
  },
  basicInfo: {
    type: basicInfoSchema,
  },
  academicInfo: {
    type: academicInfoSchema,
  },
  otherInfo: {
    type: otherInfoSchema,
  },
  username: {
    type: String,
    trim: true,
    required: [true, "Provide username"],
    unique: {
      index: true,
    },
  },
  password: {
    type: mongoose.Schema.Types.Mixed,
    required: [true, "provide password"],
    trim: true,
  },
  tokens: Array,
  active: {
    type: Boolean,
    default: true,
  },
  leaves: Array,
  role: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Role",
    required: [true, "Provide role"],
  },
  fallbackRole: {
    type: Object,
    required: true,
  },
  libraryMember: {
    type: Boolean,
    default: false,
  },
  photo: {
    type: String,
    default: "",
  },
  employeeDocuments: [
    {
      type: String,
      default: "",
    },
  ],
  contactNumber: {
    type: Number,
    required: [true, "Provide contact Number"],
  },
  plainPassword: {
    type: String,
    select: false,
  },
  forgotCode: {
    code: {
      type: String,
    },
    expire: {
      type: Date,
    },
    select: false,
  },
  refreshToken: {
    type: String,
    default: "",
  },
});

employeeSchema.pre("save", async function (next) {
  try {
    const emp = this;

    // Check if the document is new or modified
    if (emp.isNew || emp.isModified("password")) {
      // For new documents or when password is modified
      emp.plainPassword = emp.password;
      emp.password = hashing(emp.password);
    }

    // Check if the document is new
    if (emp.isNew) {
      // Generate a unique 4-digit empId
      let empId;
      do {
        empId = Math.floor(1000 + Math.random() * 9000).toString();
        // Check if the generated empId already exists
        const existingEmployee = await emp.constructor.findOne({
          "basicInfo.empId": empId,
        });
        if (!existingEmployee) {
          break;
        }
      } while (true);

      // Set the generated empId
      emp.basicInfo.empId = empId;
    }

    next();
  } catch (error) {
    console.error("Error in pre-save middleware:", error);
    next(error);
  }
});

employeeSchema.methods.generateAuthToken = async function () {
  const emp = this;
  const token = jwt.sign(
    {
      _id: emp._id.toString(),
      schoolId: emp.school?._id?.toString(),
      userType: "employee",
    },
    process.env.JWT_PRIVATE_KEY,
    {
      expiresIn: 900,
    }
  );
  return token;
};

employeeSchema.methods.generateRefreshToken = async function () {
  const emp = this;
  const token = jwt.sign(
    {
      _id: emp._id.toString(),
      schoolId: emp.school?._id?.toString(),
      userType: "employee",
    },
    process.env.JWT_PRIVATE_KEY,
    {
      expiresIn: 900,
    }
  );
  return token;
};

employeeSchema.methods.generatePermanentAuthToken = async function () {
  const emp = this;
  const token = jwt.sign(
    {
      _id: emp._id.toString(),
      userType: "employee",
      schoolId: emp.school?._id?.toString(),
    },
    process.env.JWT_PRIVATE_KEY
  );
  return token;
};

const Employee = db.model("Employee", employeeSchema);
module.exports = Employee;
module.exports.employeeSchema = employeeSchema;
