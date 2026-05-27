const jwt = require('jsonwebtoken');

const User = require('../models/User');

// =====================================
// PROTECT MIDDLEWARE
// =====================================

const protect = async (
  req,
  res,
  next
) => {

  const authHeader =
    req.headers.authorization;

  // =====================================
  // TOKEN CHECK
  // =====================================

  if (
    !authHeader ||
    !authHeader.startsWith(
      'Bearer '
    )
  ) {

    return res.status(401).json({

      message:
        'Not authorized',
    });
  }

  try {

    // =====================================
    // GET TOKEN
    // =====================================

    const token =
      authHeader.split(' ')[1];

    // =====================================
    // VERIFY TOKEN
    // =====================================

    const decoded =
      jwt.verify(
        token,
        process.env.JWT_SECRET ||
          'change-me'
      );

    // =====================================
    // FIXED ADMIN LOGIN
    // =====================================

    if (
      decoded.email ===
      'admin@smartlibrary.com'
    ) {

      req.user = {

        _id:
          '507f1f77bcf86cd799439011',

        name: 'Admin',

        email:
          'admin@smartlibrary.com',

        role: 'admin',
      };

      return next();
    }

    // =====================================
    // FIND STUDENT USER
    // =====================================

    const user =
      await User.findById(
        decoded.id
      ).select('-password');

    if (!user) {

      return res.status(401).json({

        message:
          'User not found',
      });
    }

    // =====================================
    // SET USER
    // =====================================

    req.user = user;

    next();

  } catch (error) {

    return res.status(401).json({

      message:
        'Token invalid',
    });
  }
};

// =====================================
// ROLE GUARD
// =====================================

const roleGuard =
  (role) =>
  (req, res, next) => {

    if (
      !req.user ||
      req.user.role !== role
    ) {

      return res.status(403).json({

        message:
          `${role} access required`,
      });
    }

    next();
  };

// =====================================
// ADMIN GUARD
// =====================================

const isAdmin =
  roleGuard('admin');

// =====================================
// STUDENT GUARD
// =====================================

const isStudent =
  roleGuard('student');

// =====================================
// EXPORTS
// =====================================

module.exports = {

  protect,

  isAdmin,

  isStudent,
};