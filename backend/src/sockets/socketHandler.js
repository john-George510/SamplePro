// src/sockets/socketHandler.js
const socketio = require('socket.io');
let io;

const initializeSocket = (server) => {
  io = socketio(server, {
    cors: {
      origin: '*',
      methods: ['GET', 'POST'],
    },
  });

  io.on('connection', (socket) => {
    console.log('New client connected:', socket.id);

    // Join rooms based on user or driver ID
    socket.on('join', (id) => {
      socket.join(id);
      console.log(`Socket ${socket.id} joined room ${id}`);
    });

    socket.on('disconnect', () => {
      console.log('Client disconnected:', socket.id);
    });
  });
};

module.exports = {
  initializeSocket,
  to: (id) => io.to(id),
};
