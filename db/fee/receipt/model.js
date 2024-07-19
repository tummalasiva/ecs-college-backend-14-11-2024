const mongoose = require("mongoose");
const { ToWords } = require("to-words");

require("@db/fee/feeMap/model");
require("@db/school/model");
require("@db/employee/model");
require("@db/fee/feeMapCategory/model");

const validPaymentModes = ["Cash", "DD", "Upi", "Cheque", "Netbanking", "Card"];

const toWords = new ToWords({
  localeCode: "en-IN",
  converterOptions: {
    currency: true,
    ignoreDecimal: false,
    ignoreZeroCurrency: false,
    doNotAddOnly: false,
    currencyOptions: {
      // can be used to override defaults for the selected locale
      name: "Rupee",
      plural: "Rupees",
      symbol: "₹",
      fractionalUnit: {
        name: "Paisa",
        plural: "Paise",
        symbol: "",
      },
    },
  },
});

const amountInWords = (amount) => {
  let words = toWords.convert(amount);
  return words;
};

const feePartcularSchema = new mongoose.Schema({
  feeMapCategory: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "FeeMapCategory",
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    default: "",
  },
  amount: {
    type: Number,
    required: true,
  },
});

const receiptSchema = new mongoose.Schema({
  school: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: "School",
  },
  receiptNumber: {
    type: String,
    required: true,
  },
  note: {
    type: String,
    default: "",
  },
  receiptTitle: {
    id: mongoose.Schema.Types.ObjectId,
    name: String,
    academicYearFrom: String,
    academicYearTo: String,
  },
  feeMap: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "FeeMap",
    required: true,
  },
  payeeDetails: {
    id: mongoose.Schema.Types.ObjectId,
    name: String,
    contactNumber: Number,
    academicYearId: mongoose.Schema.Types.ObjectId,
    sectionId: mongoose.Schema.Types.ObjectId,
    classId: mongoose.Schema.Types.ObjectId,
    admissionNumber: Number,
    rollNumber: Number,
    className: String,
    parentName: String,
    sectionName: String,
  },
  schoolDetails: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "School",
    required: true,
  },
  feeParticulars: {
    type: [feePartcularSchema],
    required: true,
  },
  penalty: {
    type: Number,
    default: 0,
  },
  miscellaneous: {
    type: Number,
    default: 0,
  },
  paymentMode: {
    type: String,
    enum: {
      values: validPaymentModes,
      message: "Please select a valid payment mode.",
    },
    required: true,
  },
  amountPaid: {
    type: Number,
    required: true,
  },
  amountPaidInWords: {
    type: String,
    default: function () {
      return amountInWords(this.amountPaid);
    },
  },
  paidAt: {
    type: Date,
    default: Date.now,
  },
  collectedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Employee",
    required: true,
  },
  concessionDetails: {
    amount: {
      type: Number,
      default: 0,
    },
    referredBy: {
      type: String,
      default: "",
    },
    givenAs: {
      type: String,
      enum: {
        values: ["Percentage", "Value"],
        message: "Please select a valid concession given as",
      },
    },
  },
  ddDetails: {
    bankName: String,
    branchName: String,
  },
  chequeDetails: {
    bankName: String,
    branchName: String,
    chequeNumber: String,
    chequeDate: Date,
  },
  upiDetails: {
    upiApp: String,
    utrNo: String,
  },
  netBankingDetails: {
    bankName: String,
    refNumber: String,
    paidByName: String,
  },
  cardDetails: {
    bankName: String,
    cardType: String,
  },
  reconciliationStatus: {
    type: String,
    enum: {
      values: ["Approved", "Rejected", "Null"],
      message: "Please select a valid reconciliation status.",
    },
    default: "Null",
  },
  partiallyPaid: {
    type: Boolean,
    default: false,
  },
  partialAmount: {
    type: Number,
    default: 0,
  },
  partialPaymentCompleted: {
    type: Boolean,
    default: false,
  },
  installmentPaid: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
  },
});

const Receipt = db.model("Receipt", receiptSchema);

module.exports = Receipt;
