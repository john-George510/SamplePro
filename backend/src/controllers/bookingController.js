const Booking = require('../models/Booking');
const pricingService = require('../services/pricingService');
const mongoose = require('mongoose');

// Create a new booking
exports.createBooking = async (req, res) => {
  try {
    const {
      source,
      source_latitude,
      source_longitude,
      destination,
      destination_latitude,
      destination_longitude,
      lorry_type,
      company_name,
      status,
      quantity,
      material_type,
      price_per_tonne,
      expected_amount,
      insurance_supported,
      expiration_time,
      refrigeration_required,
      fragile
    } = req.body;

    const userId = req.user.userId;
    // console.log("Request" , req);
    // console.log("User ID:", userId);
    console.log("Request Body:", req.body);

    // Ensure source and destination exist and have correct structure
    if (!source || !destination ||
        !lorry_type || !quantity || !material_type || !expiration_time) {
      return res.status(400).json({ msg: 'Invalid input. Ensure all required fields are provided correctly.' });
    }

    const pickupLocation = { 
      type: 'Point',
      coordinates: [source_longitude, source_latitude] 
    };

    const dropoffLocation = { 
      type: 'Point',
      coordinates: [destination_longitude, destination_latitude] 
    };

    // console.log("Formatted Pickup Location:", pickupLocation);
    // console.log("Formatted Dropoff Location:", dropoffLocation);

    const { price, distance } = await pricingService.estimatePrice(
      { latitude: source_latitude, longitude: source_longitude },
      { latitude: destination_latitude, longitude: destination_longitude },
      lorry_type,
      material_type,
      expiration_time,
      insurance_supported,
      quantity,
      refrigeration_required,
      fragile
    );

    const booking = new Booking({
      user: req.user.userId,
      company_name,
      status: status || 'Pending', // Default status
      pickupLocation,
      dropoffLocation,
      lorry_type,
      quantity,
      distance,
      material_type,
      price_per_tonne,
      expected_amount,
      insurance_supported,
      expiration_time,
      price,
      refrigeration_required,
      fragile
    });

    console.log("Booking Data Before Save:", booking);

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
    const userId = req.user.id;
    const bookings = await Booking.find({ user: userId }).populate('driver', 'name email');
    res.json(bookings);
  } catch (error) {
    console.error('Error fetching user bookings:', error);
    res.status(500).json({ msg: error.message });
  }
};

// exports.getAllBookings = async (req, res) => {
//   try {
//     const bookings = await Booking.find({}).populate('driver', 'name email');
//     res.json(bookings);
//   } catch (error) {
//     console.error('Error fetching all bookings:', error);
//     res.status(500).json({ msg: error.message });
//   }
// }


// Combine two bookings into a single route
exports.combineBookings = async (req, res) => {
  try {
    const { booking1Id, booking2Id } = req.body;

    // Fetch both bookings
    const booking1 = await Booking.findById(booking1Id);
    const booking2 = await Booking.findById(booking2Id);

    if (!booking1 || !booking2) {
      return res.status(404).json({ message: 'One or both bookings not found' });
    }

    if (booking1.status !== 'Pending' || booking2.status !== 'Pending') {
      return res.status(400).json({ message: 'Both bookings must be pending' });
    }

    // Set the name of the company to the first booking
    booking1.company_name = booking1.company_name + ', ' + booking2.company_name;

    // Merge booking2 details into booking1
    booking1.isCombinedRoute = true;
    booking1.combinedBookings = [booking1Id, booking2Id];
    booking1.combinedPrice = (booking1.price + booking2.price) * 0.9; // 10% discount

    // Set the correct route order
    booking1.routeOrder = [
      { location: booking1.pickupLocation, stopType: 'pickup', order: 0 },
      { location: booking2.pickupLocation, stopType: 'pickup', order: 1 },
      { location: booking2.dropoffLocation, stopType: 'dropoff', order: 2 },
      { location: booking1.pickupLocation, stopType: 'dropoff', order: 3 }
    ];

    console.log("Combined Route Order:", booking1.routeOrder);
    // Update the distance and price
    booking1.distance = booking1.distance + booking2.distance;
    booking1.price = booking1.combinedPrice

    // Set as assigned
    booking1.status = 'Assigned';

    console.log(booking1)

    // Save updated booking1
    await booking1.save();

    // Delete booking2
    await Booking.findByIdAndDelete(booking2Id);

    res.status(200).json({
      message: 'Bookings combined successfully',
      combinedBooking: booking1
    });

  } catch (error) {
    console.error('Error combining bookings:', error);
    res.status(500).json({ message: 'Error combining bookings', error: error.message });
  }
};