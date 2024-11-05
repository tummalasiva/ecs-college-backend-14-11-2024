const mongoose = require("mongoose");

require("@db/department/model");
require("@db/employee/model");

const researchProposalSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  researchArea: {
    type: String,
    required: true, // e.g., "Artificial Intelligence," "Biotechnology"
  },
  department: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Department",
    required: true, // e.g., "Computer Science," "Mechanical Engineering"
  },
  principalInvestigator: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Employee", // Reference to faculty or PI user
    required: true,
  },
  coInvestigators: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Employee", // Reference to faculty or PI user
    },
  ],
  objectives: [
    {
      type: String,
      required: true,
    },
  ],
  methodology: {
    type: String,
    required: true, // Detailed methodology description
  },
  budget: {
    totalAmount: {
      type: Number,
      required: true,
    },
    breakdown: [
      {
        item: {
          type: String, // e.g., "Equipment," "Travel"
          required: true,
        },
        amount: {
          type: Number,
          required: true,
        },
      },
    ],
  },
  fundingSource: {
    type: String, // e.g., "Internal Grant," "External Agency"
    required: true,
  },
  fundingAgency: {
    name: {
      type: String,
    },
    contactDetails: {
      phone: String,
      email: String,
      address: String,
    },
  },
  proposalStatus: {
    type: String,
    enum: [
      "Draft",
      "Submitted",
      "Approved",
      "Rejected",
      "In Progress",
      "Completed",
    ],
    default: "Draft",
  },
  approvals: {
    hod: {
      id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Employee",
      },
      name: {
        type: String,
      },
      approved: {
        type: Boolean,
        default: false,
      },
      date: {
        type: Date,
      },
    },
    //   researchCommittee: {
    //     id: {
    //       type: mongoose.Schema.Types.ObjectId,
    //       ref: 'Employee',
    //     },
    //     name: {
    //       type: String,
    //     },
    //     approved: {
    //       type: Boolean,
    //       default: false,
    //     },
    //     date: {
    //       type: Date,
    //     },
    //   },
  },
  timeline: {
    startDate: {
      type: Date,
      required: true,
    },
    endDate: {
      type: Date,
      required: true,
    },
    milestones: [
      {
        title: {
          type: String,
        },
        description: {
          type: String,
        },
        dueDate: {
          type: Date,
        },
        status: {
          type: String,
          enum: ["Pending", "Completed", "Delayed"],
          default: "Pending",
        },
      },
    ],
  },
  reports: [
    {
      title: {
        type: String,
      },
      description: {
        type: String,
      },
      submissionDate: {
        type: Date,
      },
      fileUrl: {
        type: String, // URL to the report document
      },
    },
  ],
});

module.exports = db.model("ResearchProposal", researchProposalSchema);
