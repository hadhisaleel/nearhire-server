const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
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
      default: "user",
    },

    isActive: {
      type: Boolean,
      default: true,
    },


    address: {
      city: String,
      area: String,
      pincode: String,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", userSchema);