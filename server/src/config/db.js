const mongoose = require('mongoose');

let isDatabaseReady = false;

const connectDB = async () => {
  const mongoUri = process.env.MONGODB_URI;

  if (!mongoUri) {
    console.warn('MONGODB_URI missing. Server running without database connection.');
    isDatabaseReady = false;
    return false;
  }

  try {
    await mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: 3000,
    });
    console.log('DB Connected');
    isDatabaseReady = true;
    return true;
  } catch (error) {
    console.error('MongoDB connection failed:', error.message);
    isDatabaseReady = false;
    return false;
  }
};

const requireDatabase = (_req, res, next) => {
  if (isDatabaseReady || mongoose.connection.readyState === 1) {
    return next();
  }

  return res.status(503).json({
    message: 'Database not configured. Add MONGODB_URI in server/.env to enable registration and login.',
  });
};

module.exports = connectDB;
module.exports.requireDatabase = requireDatabase;
