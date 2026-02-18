const mongoose = require("mongoose");

const workerSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
    },

    phone: {
      type: String,
      required: true,
    },

    password: {
      type: String,
      required: true,
    },

    role: {
      type: String,
      default: "worker",
    },

    skill: {
      type: String,
      required: true,
    },

    experience: {
      type: Number,
      required: true,
      min: [0, "Experience cannot be negative"],
      max: [60, "Experience seems unrealistic"],
    },

    location: {
      city: String,
      area: String,
      pincode: String,
    },

    availability: {
      type: Boolean,
      default: true,
    },

    rating: {
      type: Number,
      default: 0,
    },

    totalRatings: {
      type: Number,
      default: 0,
    },

    ratingSum: {
      type: Number,
      default: 0,
    },

    isActive: {
      type: Boolean,
      default: true,
    },

    isVerified: {
      type: Boolean,
      default: false,
    },

    verification: {
      documentUrl: {
        type: String,
      },

      status: {
        type: String,
        enum: ["not_submitted", "pending", "verified", "rejected"],
        default: "not_submitted",
      },

      rejectionReason: {
        type: String,
        default: "",
      },

      submittedAt: {
        type: Date,
      },

      verifiedAt: {
        type: Date,
      },
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Worker", workerSchema);