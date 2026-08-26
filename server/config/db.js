const mongoose = require('mongoose');

const connectDB = async () => {
  const connStr = process.env.MONGODB_URI;
  if (!connStr) {
    throw new Error('MONGODB_URI environment variable is missing.');
  }

  const conn = await mongoose.connect(connStr, {
    serverSelectionTimeoutMS: 5000,
  });
  console.log(`[MongoDB] Connected to: ${conn.connection.host}`);

  // Handle post-startup connection issues
  mongoose.connection.on('error', (err) => {
    console.error(`[MongoDB Connection Error] Post-startup database failure: ${err.message}`);
    process.exit(1);
  });

  mongoose.connection.on('disconnected', () => {
    console.error('[MongoDB Connection Lost] Disconnected from MongoDB Atlas. Exiting...');
    process.exit(1);
  });

  return conn;
};


module.exports = connectDB;

