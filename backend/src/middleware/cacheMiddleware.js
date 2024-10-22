// src/middleware/cacheMiddleware.js
const redisClient = require('../config/redis');

exports.cacheMiddleware = (req, res, next) => {
  const key = req.originalUrl;
  redisClient.get(key, (err, data) => {
    if (err) {
      console.error('Redis Get Error:', err);
      return next();
    }
    if (data) {
      res.send(JSON.parse(data));
    } else {
      res.sendResponse = res.send;
      res.send = (body) => {
        redisClient.setex(key, 3600, JSON.stringify(body)); // Cache for 1 hour
        res.sendResponse(body);
      };
      next();
    }
  });
};
