const test = require('node:test');
const assert = require('node:assert/strict');
const jwt = require('jsonwebtoken');
const generateToken = require('../utils/generateToken');

process.env.JWT_SECRET = 'test-secret';

test('generateToken encodes role and email', () => {
  const token = generateToken({
    _id: '507f1f77bcf86cd799439011',
    role: 'admin',
    email: 'admin@example.com',
    name: 'Admin',
  });

  const decoded = jwt.verify(token, process.env.JWT_SECRET);
  assert.equal(decoded.role, 'admin');
  assert.equal(decoded.email, 'admin@example.com');
});
