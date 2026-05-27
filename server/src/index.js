require('dotenv').config();

// =====================================
// IMPORTS
// =====================================

const app = require('./app');
const connectDB = require('./config/db');

// =====================================
// CONNECT DATABASE
// =====================================

connectDB()
  .then(() => {
    console.log('MongoDB Connected');
  })
  .catch((error) => {
    console.error(
      'Database Connection Error:',
      error.message
    );
  });

// =====================================
// EXPORT APP FOR VERCEL
// =====================================

module.exports = app;