require('dotenv').config();
const bcrypt = require('bcryptjs');
const connectDB = require('../config/db');
const User = require('../models/User');
const Book = require('../models/Book');
const Issue = require('../models/Issue');

const run = async () => {
  const connected = await connectDB();

  if (!connected) {
    process.exit(1);
  }

  await Promise.all([Issue.deleteMany({}), Book.deleteMany({}), User.deleteMany({})]);

  const password = await bcrypt.hash('password123', 10);
  const [admin, student] = await User.create([
    { name: 'Admin User', email: 'admin@library.com', password, role: 'admin' },
    { name: 'Student User', email: 'student@library.com', password, role: 'student' },
  ]);

  await Book.create([
    { title: 'Atomic Habits', author: 'James Clear', category: 'Self Help', totalCopies: 5, availableCopies: 5 },
    { title: 'Clean Code', author: 'Robert C. Martin', category: 'Programming', totalCopies: 3, availableCopies: 3 },
  ]);

  console.log('Seed completed', { admin: admin.email, student: student.email });
  process.exit(0);
};

run();
