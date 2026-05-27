const express = require('express');

const {
  login,
  me,
  register,
  verifyOtp,
} = require('../controllers/authController');

const {
  protect,
} = require('../middleware/authMiddleware');

const {
  requireDatabase,
} = require('../config/db');

const router = express.Router();

// ==============================
// REGISTER
// ==============================

router.post(
  '/register',
  requireDatabase,
  register
);

// ==============================
// VERIFY OTP
// ==============================

router.post(
  '/verify-otp',
  requireDatabase,
  verifyOtp
);

// ==============================
// LOGIN
// ==============================

router.post(
  '/login',
  requireDatabase,
  login
);

// ==============================
// CURRENT USER
// ==============================

router.get(
  '/me',
  requireDatabase,
  protect,
  me
);

module.exports = router;