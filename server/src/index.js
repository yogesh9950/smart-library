require('dotenv').config();

const app = require('./app');
const connectDB = require('./config/db');

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

module.exports = app;