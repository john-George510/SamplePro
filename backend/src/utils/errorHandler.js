// src/utils/errorHandler.js
const logger = require('./logger');

exports.errorHandler = (err, req, res, next) => {
  logger.error(err.stack);
  res.status(500).json({ message: 'Internal Server Error' });
};
