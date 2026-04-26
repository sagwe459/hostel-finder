// config/db.js
// Handles MongoDB connection using Mongoose.
// Called once at server startup; exits process on failure so the app
// never runs without a database connection.

const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI, {
      // These options silence deprecation warnings in newer Mongoose versions
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`❌ MongoDB Connection Error: ${error.message}`);
    // Exit with failure code — no point running without DB
    process.exit(1);
  }
};

module.exports = connectDB;
