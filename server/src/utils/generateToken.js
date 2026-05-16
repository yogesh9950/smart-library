const jwt = require('jsonwebtoken');

const generateToken = (user) =>
  jwt.sign(
    {
      id: user._id,
      role: user.role,
      email: user.email,
      name: user.name,
    },
    process.env.JWT_SECRET || 'change-me',
    { expiresIn: '7d' }
  );

module.exports = generateToken;
