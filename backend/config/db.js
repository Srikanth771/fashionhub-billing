const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI);
    console.log(`[MongoDB] Connected successfully: ${conn.connection.host} (${conn.connection.name})`);
  } catch (error) {
    console.error(`[MongoDB Connection Error] ${error.message}`);
    console.error(`Ensure your MONGODB_URI in backend/.env is correct and your IP is whitelisted in MongoDB Atlas.`);
    // Do not terminate process in development so server continues serving health status
  }
};

module.exports = connectDB;
