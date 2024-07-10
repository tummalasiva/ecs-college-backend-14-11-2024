const mongoose = require("mongoose");

require("@db/school/model");
require("@db/hostel/model");
require("@db/transport/route/model");
require("@db/room/model");
require("@db/transport/stop/model");
require("@db/class/model");
require("@db/academicYear/model");
require("@db/student/model");
require("@db/employee/model");

const VALID_DEPENDENCIES = [
  "class",
  "room",
  "academicYear",
  "route",
  "stop",
  "addedBefore",
  "addedAfter",
  "libraryMember",
  "transportMember",
  "hostelMember",
  "pickType",
];

const getExtentedDependencies = (dependencies) => {
  let allDependencies = [...dependencies];
  for (let dep of dependencies) {
    if (dep === "stop") {
      allDependencies = [...allDependencies, "route"];
    }
  }

  return [...new Set(allDependencies)];
};

const installmentSchema = new mongoose.Schema({
  amount: {
    type: Number,
    required: true,
  },
  dueDate: {
    type: Date,
    required: true,
  },
});

const feeMapSchema = new mongoose.Schema({
  school: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "School",
    required: true,
  },
  academicYear: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "AcademicYear",
    required: true,
  },
  receiptTitle: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "ReceiptTitle",
    required: true,
  },
  collectedFrom: {
    type: String,
    enum: {
      values: ["student", "employee"],
      message: "Please select a valid callected from type! student || employee",
    },
    default: "student",
    required: true,
  },
  dependencies: {
    type: [String],
    enum: VALID_DEPENDENCIES,
    required: true,
  },
  extendedDependencies: {
    type: [String],
    enum: VALID_DEPENDENCIES,
    default: function () {
      return getExtentedDependencies(this.dependencies);
    },
    required: true,
  },
  class: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Class",
    required: function () {
      return this.dependencies.includes("class") ? true : false;
    },
  },
  academicYearId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "AcademicYear",
    required: function () {
      this.dependencies.includes("academicYear") ? true : false;
    },
  },

  stop: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Stop",
    required: function () {
      return this.dependencies.includes("stop");
    },
  },
  route: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Route",
    required: function () {
      return this.dependencies.includes("route") ? true : false;
    },
  },
  libraryMember: {
    type: String,
    enum: {
      values: ["yes", "no"],
    },
    required: function () {
      return this.dependencies.includes("libraryMember") ? true : false;
    },
  },
  room: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Room",
    required: function () {
      return this.dependencies.includes("room") ? true : false;
    },
  },
  hostelMember: {
    type: String,
    enum: {
      values: ["yes", "no"],
    },
    required: function () {
      return this.dependencies.includes("hostelMember") ? true : false;
    },
  },
  transportMember: {
    type: String,
    enum: {
      values: ["yes", "no"],
    },
    required: function () {
      return this.dependencies.includes("hostelMember") ? true : false;
    },
  },
  addedBefore: {
    type: Date,
    required: function () {
      return this.dependencies.includes("addedBefore") ? true : false;
    },
  },
  addedAfter: {
    type: Date,
    required: function () {
      return this.dependencies.includes("addedBefore") ? true : false;
    },
  },
  fee: {
    type: Number,
    required: true,
  },
  installments: {
    type: [installmentSchema],
    required: true,
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Employee",
    required: true,
  },
  active: {
    type: Boolean,
    default: true,
  },
});

const FeeMap = db.model("FeeMap", feeMapSchema);

module.exports.FeeMap = FeeMap;
module.exports.getExtentedDependencies = getExtentedDependencies;
