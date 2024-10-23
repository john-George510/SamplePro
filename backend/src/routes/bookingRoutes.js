// backend/src/routes/bookingRoutes.js

const express = require('express');
const router = express.Router();
const { createBooking, getUserBookings } = require('../controllers/bookingController');
const authMiddleware = require('../middleware/authMiddleware');
const Booking = require('../models/Booking'); // Ensure Booking model is imported

// Create a booking
router.post('/', authMiddleware, createBooking);

// Get user bookings
router.get('/', authMiddleware, getUserBookings);

// List all bookings (orders)
router.get('/all', authMiddleware, async (req, res) => {
  try {
    const { latitude, longitude } = req.query;
    const bookings = await Booking.find({})
    console.log(bookings);
    
    res.json(bookings);
  } catch (error) {
    console.error('Error fetching all bookings:', error);
    res.status(500).json({ message: 'Server Error' });
  }
});

// Assign booking to driver
router.put('/:bookingid/assign', authMiddleware, async (req, res) => {
  try {
    if (req.user.role !== 'driver') {
      return res.status(403).json({ message: 'Access denied. Drivers only.' });
    }

    const bookingId = req.params.bookingid;

    // Find the booking by ID
    const booking = await Booking.findById(bookingId);

    if (!booking) {
      return res.status(404).json({ message: 'Booking not found.' });
    }

    // Check if booking is already assigned
    if (booking.status === 'Assigned') {
      return res.status(400).json({ message: 'Booking is already assigned.' });
    }

    console.log('Assigning driver with ID:', req.user.id);

    // Assign the driver and update the status
    booking.driver = req.user.userId;
    booking.status = 'Assigned';

    // Save the updated booking
    const updatedBooking = await booking.save();

    // Populate the driver field with name and email
    await updatedBooking.populate('driver', 'name email');

    // Emit a real-time event to notify the user about the assignment
    // Ensure that your server.js stores io instance in app.locals.io
    req.app.locals.io.to(bookingId.toString()).emit('bookingAssigned', {
      bookingId: updatedBooking._id,
      driver: updatedBooking.driver,
      status: updatedBooking.status,
    });

    res.json(updatedBooking);
  } catch (error) {
    console.error('Error assigning booking:', error);
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
