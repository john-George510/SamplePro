// backend/src/config/redis.js

const { createClient } = require('redis');
require('dotenv').config();

// Retrieve the Redis URI from environment variables
const redisURI = process.env.REDIS_URI;

const redisClient = createClient({
  url: redisURI,
  // Uncomment and configure the following if your Redis instance requires TLS/SSL
  // socket: {
  //   tls: true,
  //   rejectUnauthorized: false, // Adjust based on your SSL setup
  // },
});

// Event listener for Redis errors
redisClient.on('error', (err) => console.error('Redis Client Error', err));

// Export the Redis client for use in other parts of the application
module.exports = redisClient;
