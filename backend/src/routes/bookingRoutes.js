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
    const bookings = await Booking.find({}).populate('user', 'name email').populate('driver', 'name email');
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

    const updatedBooking = await Booking.findByIdAndUpdate(
      req.params.bookingid,
      { $set: { driver: req.user.id, status: 'Assigned' } },
      { new: true } // Return the updated document
    );

    if (!updatedBooking) {
      return res.status(404).json({ message: 'Booking not found.' });
    }

    res.json(updatedBooking);
  } catch (error) {
    console.error('Error assigning booking:', error);
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
