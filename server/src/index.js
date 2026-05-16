const dotenv = require('dotenv');
const app = require('./app');
const connectDB = require('./config/db');

dotenv.config();

const port = process.env.PORT || 5000;

const startServer = async () => {
  try {
    await connectDB();
  } catch (error) {
    console.error('Startup DB check failed:', error.message);
  }

  app.listen(port, () => {
    console.log(`Server running on port ${port}`);
  });
};

startServer();
