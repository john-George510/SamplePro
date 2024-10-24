const http = require('http');
const app = require('./app');
const connectDB = require('./config/db');
const redisClient = require('./config/redis');
const demandMonitor = require('./workers/demandMonitor');
const jwt = require('jsonwebtoken'); // Add this import
const mongoose = require('mongoose'); 
const Booking = require('./models/Booking');
require('dotenv').config();

const server = http.createServer(app);

// Socket.IO setup with authentication
const { Server } = require('socket.io');
const io = new Server(server, {
  cors: {
    origin: '*', // Adjust origin in production
    methods: ['GET', 'POST'],
  },
});

// Authentication middleware for Socket.IO
io.use((socket, next) => {
  const token = socket.handshake.auth.token;
  if (!token) {
    return next(new Error('Authentication error: Token not provided'));
  }
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    socket.user = decoded; // Attach user info to socket
    next();
  } catch (err) {
    next(new Error('Authentication error: Invalid token'));
  }
});

// Store io instance in app locals for use in routes or controllers
app.locals.io = io;

const PORT = process.env.PORT || 5000;

// Driver locations storage (Optional: Use Redis for scaling)
let driverLocations = {};

// Setup Socket.IO handlers
io.on('connection', (socket) => {
  console.log(`User connected: ${socket.user.userId} with role: ${socket.user.role}`);

  // Handle driver-specific events
  if (socket.user.role === 'driver') {
    // Listen for clients joining a booking room
    console.log("socket user tried to join booking room")
    socket.on('joinBookingRoom', ({ bookingId }) => {
      console.log(`Received joinBookingRoom event for booking ID: ${bookingId}`);
      socket.join(bookingId);
      console.log(`Driver ${socket.user.userId} joined room: ${bookingId}`);
    });

    // Listen for driver location updates
    socket.on('driverLocationUpdate', async ({ bookingId, driverId,coordinates }) => {
      console.log("driver location update received")
      try {
        if (!mongoose.Types.ObjectId.isValid(bookingId)) {
          throw new Error('Invalid booking ID');
        }

        // Verify driver assignment
        const booking = await Booking.findById(bookingId).populate('driver');
        if (!booking || !booking.driver || booking.driver._id.toString() !== socket.user.userId) {
          throw new Error('Unauthorized booking ID');
        }

        // Update driver location in Redis
        await redisClient.hSet('driverLocations', socket.user.userId, JSON.stringify(coordinates));

        // Emit location update to the booking room
        io.to(bookingId).emit('locationUpdate', { bookingId,driverId: socket.user.userId, coordinates });
        console.log(`Driver ${socket.user.userId} location updated for booking ${bookingId}:`, coordinates);
      } catch (error) {
        console.error('Error in driverLocationUpdate:', error.message);
        socket.emit('error', { message: error.message });
      }
    });

    // Listen for driver status updates
    socket.on('driverStatusUpdate', async ({ bookingId, status }) => {
      try {
        if (!mongoose.Types.ObjectId.isValid(bookingId)) {
          throw new Error('Invalid booking ID');
        }

        // Verify driver assignment
        const booking = await Booking.findById(bookingId).populate('driver');
        if (!booking || !booking.driver || booking.driver._id.toString() !== socket.user.userId) {
          throw new Error('Unauthorized booking ID');
        }

        // Update booking status in MongoDB
        booking.status = status;
        await booking.save();

        // Emit status update to the booking room
        io.to(bookingId).emit('statusUpdate', { status });
        console.log(`Booking ${bookingId} status updated to: ${status} by driver ${socket.user.userId}`);
      } catch (error) {
        console.error('Error in driverStatusUpdate:', error.message);
        socket.emit('error', { message: error.message });
      }
    });
  }

  // Handle user-specific events
  if (socket.user.role === 'user') {
    // Listen for clients joining a booking room
    socket.on('joinBookingRoom', ({ bookingId }) => {
      socket.join(bookingId);
      console.log(`User ${socket.user.userId} joined room: ${bookingId}`);
      // console.log("socket user", socket.user)
    });
  }

  // Handle disconnection
  socket.on('disconnect', async () => {
    console.log(`Client disconnected: ${socket.id}`);

    if (socket.user.role === 'driver') {
      // Remove driver location from Redis
      await redisClient.hDel('driverLocations', socket.user.userId);
      console.log(`Driver ${socket.user.userId} location removed from Redis`);
    }
  });
});

// Connect to MongoDB and Redis, then start the server
(async () => {
  try {
    await connectDB();
    await redisClient.connect();
    console.log('Connected to Redis');

    // Start demand monitor
    demandMonitor();

    server.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error('Server Error:', error);
    process.exit(1); // Exit process with failure
  }
})();

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
  // Application specific logging, throwing an error, or other logic here
});

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception thrown:', error);
  process.exit(1); // Exit process with failure
});
