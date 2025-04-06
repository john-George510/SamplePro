const mongoose = require('mongoose');
require('dotenv').config();

const connectDB = async () => {
  try {
    const uri = process.env.MONGO_URI;
    console.log('Connecting to MongoDB...');
    console.log(`MongoDB URI: ${uri}`); // Log the URI for debugging
    if (!uri) throw new Error('MONGO_URI is not defined in .env');

    await mongoose.connect(uri);
    console.log('MongoDB Connected');
  } catch (error) {
    console.error(`MongoDB Connection Error: ${error.message}`);
    process.exit(1); // Exit with failure
  }
};

module.exports = connectDB;
