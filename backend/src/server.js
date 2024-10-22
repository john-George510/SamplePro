const http = require('http');
const app = require('./app');
const connectDB = require('./config/db');
const redisClient = require('./config/redis');
const demandMonitor = require('./workers/demandMonitor');

require('dotenv').config();

const server = http.createServer(app);

// Socket.io setup
const { Server } = require('socket.io');
const io = new Server(server, {
  cors: {
    origin: '*',
  },
});

// Store io instance in app locals
app.locals.io = io;

const PORT = process.env.PORT || 5000;

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
  }
})();
