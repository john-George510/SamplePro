const Booking = require('../models/Booking');
const Driver = require('../models/Driver');

exports.getAssignments = async (req, res) => {
  try {
    const driver = await Driver.findOne({ userId: req.user.userId });
    const bookings = await Booking.find({ driverId: driver._id, status: 'Assigned' });
    res.json(bookings);
  } catch (error) {
    res.status(500).json({ msg: error.message });
  }
};

exports.updateLocation = (socket) => {
  socket.on('locationUpdate', (data) => {
    // Update driver's location in the database
    // Emit location to users tracking the driver
  });
};
