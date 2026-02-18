const mongoose = require("mongoose");

const serviceRequestSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    worker: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Worker",
      required: true,
    },

    problemDescription: {
      type: String,
      required: true,
    },

    location: {
      city: String,
      area: String,
      pincode: String,
    },

    preferredDate: {
      type: Date,
      required: true,
    },
    price: {
      type: Number,
      min: 0,
    },
    rating: {
      type: Number,
      min: 1,
      max: 5,
    },

    review: {
      type: String,
      trim: true,
    },

    ratedAt: Date,



    status: {
      type: String,
      enum: ["pending", "accepted", "rejected", "completed", "cancelled"],
      default: "pending",
    },

    acceptedAt: Date,
    completedAt: Date,
    cancelledAt: Date,
    rejectionReason: {
  type: String,
  trim: true,
},

  },
  { timestamps: true }
);

module.exports = mongoose.model("ServiceRequest", serviceRequestSchema);