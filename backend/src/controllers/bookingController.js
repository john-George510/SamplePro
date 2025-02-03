const Booking = require('../models/Booking');
const pricingService = require('../services/pricingService');

// Create a new booking
exports.createBooking = async (req, res) => {
  try {
    const {
      source,
      destination,
      lorry_type,
      company_name,
      status,
      quantity,
      material_type,
      price_per_tonne,
      expected_amount,
      insurance_supported,
      expiration_hours,
      refrigeration_required,
      fragile
    } = req.body;

    const userId = req.user.userId;
    // console.log("Request" , req);
    // console.log("User ID:", userId);
    console.log("Request Body:", req.body);

    // Ensure source and destination exist and have correct structure
    if (!source || !destination ||
        !lorry_type || !quantity || !material_type || !expiration_hours) {
      return res.status(400).json({ msg: 'Invalid input. Ensure all required fields are provided correctly.' });
    }

    const pickupLocation = { 
      type: 'Point',
      coordinates: [source.longitude, source.latitude] 
    };

    const dropoffLocation = { 
      type: 'Point',
      coordinates: [destination.longitude, destination.latitude] 
    };

    // console.log("Formatted Pickup Location:", pickupLocation);
    // console.log("Formatted Dropoff Location:", dropoffLocation);

    const { price, distance } = await pricingService.estimatePrice(
      { latitude: source.latitude, longitude: source.longitude },
      { latitude: destination.latitude, longitude: destination.longitude },
      lorry_type,
      material_type,
      expiration_hours,
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
      expiration_hours,
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
