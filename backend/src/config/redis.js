// backend/src/config/redis.js

const { createClient } = require('redis');
require('dotenv').config();

// Retrieve the Redis URI from environment variables
const redisClient = createClient({
  url: process.env.REDIS_URL,  // Should be in format: "redis://username:password@host:port"
  socket: {
    connectTimeout: 5000,  // 5 seconds timeout
    tls: process.env.NODE_ENV === 'production'  // Enable TLS in production
  }
});

// For local development (fallback)
if (process.env.NODE_ENV !== 'production' && !process.env.REDIS_URL) {
  redisClient.url = 'redis://localhost 6379';
}

redisClient.on('error', (err) => console.log('Redis Client Error', err));

// Event listener for Redis errors
redisClient.on('error', (err) => console.error('Redis Client Error', err));

// Export the Redis client for use in other parts of the application
module.exports = redisClient;
