// src/services/notificationService.js
const io = require('../sockets/socketHandler');

exports.notifyDriver = (driverId, bookingId) => {
  io.to(driverId).emit('newAssignment', { bookingId });
};
