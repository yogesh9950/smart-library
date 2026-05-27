const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
  {
    // =========================
    // FULL NAME
    // =========================
    name: {
      type: String,
      required: true,
      trim: true,
    },

    // =========================
    // STUDENT RID
    // =========================
    rid: {
      type: String,
      trim: true,
      uppercase: true,
      unique: true,
      sparse: true,
    },

    // =========================
    // EMAIL
    // =========================
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },

    // =========================
    // PASSWORD
    // =========================
    password: {
      type: String,
      required: true,
      minlength: 6,
    },

    // =========================
    // USER ROLE
    // =========================
    role: {
      type: String,
      enum: ['admin', 'student'],
      default: 'student',
    },

    // =========================
    // EMAIL OTP
    // =========================
    otp: {
      type: String,
      default: null,
    },

    // =========================
    // OTP EXPIRY
    // =========================
    otpExpiry: {
      type: Date,
      default: null,
    },

    // =========================
    // EMAIL VERIFIED
    // =========================
    isVerified: {
      type: Boolean,
      default: false,
    },
  },

  {
    timestamps: true,
  }
);

module.exports = mongoose.model(
  'User',
  userSchema
);