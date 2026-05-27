require('dotenv').config();

// =====================================
// IMPORTS
// =====================================

const app = require('./app');

const connectDB = require('./config/db');

// =====================================
// PORT
// =====================================

const PORT =
  process.env.PORT || 5000;

// =====================================
// START SERVER
// =====================================

const startServer = async () => {

  try {

    // CONNECT DATABASE

    await connectDB();

    console.log('DB Connected');

    // START EXPRESS SERVER

    app.listen(PORT, () => {

      console.log(
        `Server running on port ${PORT}`
      );

    });

  } catch (error) {

    console.error(
      'Startup Error:',
      error.message
    );

  }
};

// =====================================
// RUN SERVER
// =====================================

startServer();