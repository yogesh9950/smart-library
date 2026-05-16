const bcrypt = require('bcryptjs');
const User = require('../models/User');
const generateToken = require('../utils/generateToken');

const sanitizeUser = (user) => ({
  _id: user._id,
  name: user.name,
  rid: user.rid,
  email: user.email,
  role: user.role,
  createdAt: user.createdAt,
});

const register = async (req, res) => {
  try {
    const { name, rid, email, password, role } = req.body;

    if (!name || !email || !password || (role !== 'admin' && !rid)) {
      return res.status(400).json({ message: 'Full name, RID, email, and password are required for students' });
    }

    if (role !== 'admin' && !/^R\d{5}$/i.test(rid)) {
      return res.status(400).json({ message: 'RID format must be like R43123' });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    if (role !== 'admin') {
      const existingRid = await User.findOne({ rid: rid.toUpperCase() });
      if (existingRid) {
        return res.status(400).json({ message: 'RID already exists' });
      }
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({
      name,
      rid: role === 'admin' ? undefined : rid.toUpperCase(),
      email,
      password: hashedPassword,
      role: role === 'admin' ? 'admin' : 'student',
    });

    return res.status(201).json({
      message: 'User registered successfully',
      token: generateToken(user),
      user: sanitizeUser(user),
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    return res.json({
      message: 'Login successful',
      token: generateToken(user),
      user: sanitizeUser(user),
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

const me = async (req, res) => res.json({ user: req.user });

module.exports = { register, login, me };
