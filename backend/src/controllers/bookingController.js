// backend/src/controllers/bookingController.js

const Booking = require('../models/Booking');
const pricingService = require('../services/pricingService');

// Create a new booking
exports.createBooking = async (req, res) => {
  try {
    const { pickupLocation, dropoffLocation, vehicleType } = req.body;
    const userId = req.user.id; // Corrected access

    // Validate input
    if (
      !pickupLocation ||
      !dropoffLocation ||
      typeof pickupLocation.latitude !== 'number' ||
      typeof pickupLocation.longitude !== 'number' ||
      typeof dropoffLocation.latitude !== 'number' ||
      typeof dropoffLocation.longitude !== 'number' ||
      !vehicleType
    ) {
      return res.status(400).json({ msg: 'All fields are required and must be valid.' });
    }

    const estimatedCost = await pricingService.estimatePrice(pickupLocation, dropoffLocation, vehicleType);

    const booking = new Booking({
      user: userId,
      pickupLocation: {
        type: 'Point',
        coordinates: [pickupLocation.longitude, pickupLocation.latitude],
      },
      dropoffLocation: {
        type: 'Point',
        coordinates: [dropoffLocation.longitude, dropoffLocation.latitude],
      },
      vehicleType,
      estimatedCost,
    });

    await booking.save();

    res.status(201).json(booking);
  } catch (error) {
    console.error('Error creating booking:', error);
    res.status(500).json({ msg: error.message });
  }
};

// Get user bookings
exports.getUserBookings = async (req, res) => {
  try {
    const userId = req.user.id; // Corrected access
    const bookings = await Booking.find({ user: userId }).populate('driver', 'name email');
    res.json(bookings);
  } catch (error) {
    console.error('Error fetching user bookings:', error);
    res.status(500).json({ msg: error.message });
  }
};
