require('dotenv').config();
const mongoose = require('mongoose');
const dns = require('node:dns');

// Set public DNS servers to fix SRV lookup issues
dns.setServers(['1.1.1.1', '1.0.0.1']);

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI);
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`Error connecting to MongoDB: ${error.message}`);
    process.exit(1);
  }
};

module.exports = connectDB;
