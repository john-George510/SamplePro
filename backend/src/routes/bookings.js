// backend/routes/bookings.js

const express = require('express');
const router = express.Router();
const Booking = require('../models/Booking');
const calculateDistance = require('../utils/calculateDistance');
const calculatePrice = require('../utils/calculatePrice');

// Middleware for authentication
const { protect } = require('../middleware/auth');

// @route   POST /api/bookings
// @desc    Create a new booking
// @access  Private
router.post('/', protect, async (req, res) => {
  try {
    const { pickupLocation, dropoffLocation, vehicleType } = req.body;

    if (!pickupLocation || !dropoffLocation || !vehicleType) {
      return res.status(400).json({ message: 'Please provide all required fields.' });
    }

    // Calculate distance
    const distance = calculateDistance(
      pickupLocation.latitude,
      pickupLocation.longitude,
      dropoffLocation.latitude,
      dropoffLocation.longitude
    );

    // Calculate price
    const price = calculatePrice(distance, vehicleType);

    const booking = new Booking({
      user: req.user.id,
      pickupLocation: {
        type: 'Point',
        coordinates: [pickupLocation.longitude, pickupLocation.latitude],
      },
      dropoffLocation: {
        type: 'Point',
        coordinates: [dropoffLocation.longitude, dropoffLocation.latitude],
      },
      vehicleType,
      distance,
      price,
    });

    const createdBooking = await booking.save();

    res.status(201).json(createdBooking);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
});

// @route   GET /api/bookings/user
// @desc    Get bookings for the authenticated user
// @access  Private
router.get('/user', protect, async (req, res) => {
  try {
    const bookings = await Booking.find({ user: req.user.id }).sort({ createdAt: -1 });
    res.json(bookings);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
});

// @route   GET /api/bookings/nearby
// @desc    Get bookings within 100 km of the driver's location
// @access  Private (Drivers only)
router.get('/nearby', protect, async (req, res) => {
  try {
    // Ensure the user is a driver
    if (req.user.role !== 'driver') {
      return res.status(403).json({ message: 'Access denied. Drivers only.' });
    }

    const { latitude, longitude } = req.query;

    if (!latitude || !longitude) {
      return res.status(400).json({ message: 'Please provide latitude and longitude.' });
    }

    const distanceThreshold = 100 * 1000; // 100 km in meters

    const nearbyBookings = await Booking.aggregate([
      {
        $geoNear: {
          near: { type: 'Point', coordinates: [parseFloat(longitude), parseFloat(latitude)] },
          distanceField: 'dist.calculated',
          maxDistance: distanceThreshold,
          spherical: true,
          query: { status: 'Pending' },
        },
      },
      {
        $project: {
          user: 1,
          pickupLocation: 1,
          dropoffLocation: 1,
          vehicleType: 1,
          distance: 1,
          price: 1,
          status: 1,
          driver: 1,
          createdAt: 1,
          'dist.calculated': 1,
        },
      },
    ]);

    res.json(nearbyBookings);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
});

router.put('/:bookingid/assign', protect, async (req, res) => {
    try {
      // Ensure the user is a driver
      if (req.user.role !== 'driver') {
        return res.status(403).json({ message: 'Access denied. Drivers only.' });
      }
  
      const booking = await Booking.findById(req.params.id);
  
      if (!booking) {
        return res.status(404).json({ message: 'Booking not found.' });
      }
  
      if (booking.status !== 'Pending') {
        return res.status(400).json({ message: 'Booking is not available for assignment.' });
      }
  
      // Assign the driver and update status
      booking.driver = req.user.id;
      booking.status = 'Assigned';
  
      await booking.save();
  
      res.json(booking);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Server Error' });
    }
  });


module.exports = router;
