const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const moment = require("moment");

const schoolSchema = new mongoose.Schema({
  active: {
    type: Boolean,
    default: false,
  },
  name: {
    type: String,
    required: [true, "Provide school name"],
    trim: true,
  },
  address: {
    type: String,
    required: [true, "provide school address"],
    trim: true,
  },
  phone: {
    type: String,
    required: [true, "Provide school phone"],
    trim: true,
  },
  regDate: {
    type: Date,
    validate: {
      validator: function (v) {
        return moment(v, "YYYY-MM-DD", true).isValid();
      },
      message: (props) =>
        `${props.value} Invalid date, provide in "YYYY-MM_DD" format`,
    },
    required: [true, "Provide registration date"],
  },
  email: {
    type: String,
    required: [true, "Provide school email"],
    trim: true,
  },
  fax: {
    type: String,
    trim: true,
    default: "",
  },
  websiteFooter: {
    type: String,
    default: "",
  },
  description: {
    type: String,
    default: "",
  },
  logo: {
    type: String,
    default: "",
  },
  facebookUrl: {
    type: String,
    trim: true,
    default: "",
  },
  twitterUrl: {
    type: String,
    trim: true,
    default: "",
  },
  linkedinUrl: {
    type: String,
    trim: true,
    default: "",
  },
  gplusUrl: {
    type: String,
    trim: true,
    default: "",
  },
  youtubeUrl: {
    type: String,
    trim: true,
    default: "",
  },
  instagramUrl: {
    type: String,
    trim: true,
    default: "",
  },
  pinterestUrl: {
    type: String,
    trim: true,
    default: "",
  },
  currency: {
    type: String,
    default: "",
  },
  currencySymbol: {
    type: String,
    default: "",
  },
  sessionStartMonth: {
    type: Date,
    default: null,
    required: true,
  },
  sessionEndMonth: {
    type: Date,
    default: "",
    required: true,
  },

  latitude: {
    type: String,
    default: "",
  },
  longitude: {
    type: String,
    default: "",
  },
  location: {
    type: String,
    default: "",
  },
  googleAnalyticsId: {
    type: String,
    default: "",
  },
  defaultTimeZone: {
    type: Object,
    default: null,
  },
  bannerImages: {
    type: Array,
    default: [],
  },

  selectedTheme: {
    type: Number,
    default: 1,
  },

  isMainCampus: {
    type: Boolean,
    default: false,
  },
  mandatoryAttendance: {
    type: Boolean,
    default: false,
  },
  mandatoryAttendancePercentage: {
    type: Number,
    default: 0,
    required: function () {
      return this.mandatoryAttendance;
    },
  },
  lowAttendanceAction: {
    type: String,
    default: "",
    enum: {
      values: ["Disable Exam", "Penalty"],
    },
    required: function () {
      return this.mandatoryAttendance;
    },
  },
  penaltyAmount: {
    type: Number,
    default: 0,
    required: function () {
      return this.mandatoryAttendance && this.lowAttendanceAction === "Penalty";
    },
  },
  academicSemester1: {
    from: {
      type: String,
      required: true,
    },
    to: {
      type: String,
      required: true,
    },
  },
  academicSemester2: {
    from: {
      type: String,
      required: true,
    },
    to: {
      type: String,
      required: true,
    },
  },
});

const School = db.model("School", schoolSchema);

module.exports = School;
