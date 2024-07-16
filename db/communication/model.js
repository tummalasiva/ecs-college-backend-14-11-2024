const mongoose = require("mongoose");

require("@db/school/model");

const recipientSchema = new mongoose.Schema({
  name: {
    type: String,
    default: "",
  },
  contactNumber: {
    type: String,
    default: "",
  },
  section: {
    type: String,
    default: "",
  },
  class: {
    type: String,
    default: "",
  },
});

// reason: 'success',
// code: '000',
// clientsmsid: 623348197,
// messageid: 257095757,
// mobileno: '+917892073195',
// status: 'success',
// deliveryStatus: 'Unavailable'

const messageDetailsSchema = new mongoose.Schema({
  reason: String,
  code: String,
  clientsmsid: Number,
  messageid: Number,
  mobileno: String,
  status: String,
  deliveryStatus: { type: String, default: "" },
});

const smsSchema = new mongoose.Schema({
  school: {
    type: mongoose.Types.ObjectId,
    ref: "School",
    required: true,
  },
  smsType: {
    type: String,
    required: [true, "Provide sms type"],
  },
  smsCategory: {
    type: String,
    required: [true, "Please provide a valid sms category"],
  },
  smsSubject: {
    type: String,
    default: "",
  },
  smsTemplateId: {
    type: String,
    default: "",
  },
  message: {
    type: String,
    required: [true, "provide message"],
  },
  sentTime: {
    type: Date,
    default: Date.now,
  },
  notifyRecipients: {
    type: Boolean,
    default: false,
  },
  messageDetails: [messageDetailsSchema],

  totalMessagesSent: {
    type: Number,
    default: function () {
      return this.messageDetails ? this.messageDetails.length : 0;
    },
  },
  totalRejected: {
    type: Number,
    default: 0,
  },
  totalUndelivered: {
    type: Number,
    default: 0,
  },
  totalBlocked: { type: Number, default: 0 },
  totalWaiting: {
    type: Number,
    default: function () {
      return this.messageDetails ? this.messageDetails.length : 0;
    },
  },
  totalDelivered: {
    type: Number,
    default: 0,
  },
  receipients: {
    type: [recipientSchema],
    default: [],
  },
  seen: {
    type: Boolean,
    default: false,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

const SMS = db.model("sms", smsSchema);

module.exports = SMS;
