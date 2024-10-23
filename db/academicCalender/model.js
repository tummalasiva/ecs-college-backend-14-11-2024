const mongoose = require("mongoose");

require("@db/academicYear/model");
require("@db/semester/model");

const academicCalendarSchema = new mongoose.Schema({
  academicYear: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "AcademicYear",
    required: true,
  },
  terms: [
    {
      year: {
        type: Number,
        required: true,
      },
      semester: {
        type: String,
        enum: ["First Academic Semester", "Second Academic Semester"],
        required: true,
      },
      registrationDeadline: {
        type: Date,
        default: null,
      },
      dropDeadline: {
        type: Date,
        default: null,
      },
      classesStartDate: {
        type: Date,
        default: null,
      },
      classesEndDate: {
        type: Date,
        default: null,
      },
      tests: [
        {
          examTitle: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "ExamTitle",
            required: true,
          },
          startDate: {
            type: Date,
            required: true,
          },
          endDate: {
            type: Date,
            required: true,
          },
        },
      ],
      holidays: [
        {
          holidayName: {
            type: String,
            required: true,
          },
          startDate: {
            type: Date,
            required: true,
          },

          endDate: {
            type: Date,
            required: true,
          },
        },
      ],
      breaks: [
        {
          breakName: {
            type: String,
            required: true,
          },
          startDate: {
            type: Date,
            required: true,
          },
          endDate: {
            type: Date,
            required: true,
          },
        },
      ],
    },
  ],
  admissionDates: {
    applicationStart: {
      type: Date,
      required: true,
    },
    applicationEnd: {
      type: Date,
      required: true,
    },
    admissionStart: {
      type: Date,
      required: true,
    },
    admissionEnd: {
      type: Date,
      required: true,
    },
  },
  feePaymentDeadlines: [
    {
      description: {
        type: String,
        required: true,
        // Example: "Tuition Fee Payment", "Hostel Fee Payment"
      },
      deadline: {
        type: Date,
        required: true,
      },
    },
  ],
  events: [
    {
      eventName: {
        type: String,
        required: true,
        // Example: "Convocation", "Orientation"
      },
      eventDate: {
        type: Date,
        required: true,
      },
      description: {
        type: String,
        default: "",
      },
    },
  ],
  coCurricularActivities: [
    {
      activityName: {
        type: String,
        required: true,
        // Example: "Sports Day", "Cultural Fest"
      },
      startDate: {
        type: Date,
        required: true,
      },
      endDate: {
        type: Date,
        required: true,
      },
    },
  ],
  placementActivities: [
    {
      activityName: {
        type: String,
        required: true,
        // Example: "Job Fair", "Internship Placement"
      },
      startDate: {
        type: Date,
        required: true,
      },
      endDate: {
        type: Date,
        required: true,
      },
    },
  ],
  projectSubmissionDeadlines: [
    {
      projectName: {
        type: String,
        required: true,
        // Example: "Final Year Project", "Research Thesis"
      },
      submissionDate: {
        type: Date,
        required: true,
      },
    },
  ],
  meetings: [
    {
      meetingName: {
        type: String,
        required: true,
        // Example: "Faculty Meeting", "Academic Council Meeting"
      },
      meetingDate: {
        type: Date,
        required: true,
      },
      description: {
        type: String,
        default: "",
      },
    },
  ],
  specialPrograms: [
    {
      programName: {
        type: String,
        required: true,
        // Example: "Certification Course", "Skill Development Program"
      },
      startDate: {
        type: Date,
        required: true,
      },
      endDate: {
        type: Date,
        required: true,
      },
    },
  ],
});

module.exports = db.model("AcademicCalendar", academicCalendarSchema);
