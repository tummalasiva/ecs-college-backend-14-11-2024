const mongoose = require("mongoose");

require("@db/school/model");
require("@db/hostel/model");
require("@db/transport/route/model");
require("@db/room/model");
require("@db/transport/stop/model");
require("@db/class/model");
require("@db/employee/model");

const VALID_DEPENDENCIES = [
  "class",
  "classOld",
  "classNew",
  "transport",
  "hostel",
  "stop",
  "route",
  "pickType",
];

const getExtentedDependencies = (dependencies) => {
  let allDependencies = [...dependencies];
  for (let dep of dependencies) {
    if (dep === "transport") {
      allDependencies = [...allDependencies, "route", "stop", "pickType"];
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
  receiptTitle: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "ReceiptTitle",
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
  installmentType: {
    type: String,
    required: true,
  },
  class: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Class",
    required: function () {
      return this.dependencies.includes("class") ||
        this.dependencies.includes("classOld") ||
        this.dependencies.includes("classNew")
        ? true
        : false;
    },
  },

  stop: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Stop",
    required: function () {
      return this.dependencies.includes("transport");
    },
  },
  route: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Route",
    required: function () {
      return this.dependencies.includes("transport") ? true : false;
    },
  },
  pickType: {
    type: String,
    enum: {
      values: ["Both", "Pick", "Drop"],
    },
  },

  hostel: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Hostel",
    required: function () {
      return this.dependencies.includes("hostel") ? true : false;
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
  deleted: {
    type: Boolean,
    default: false,
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
