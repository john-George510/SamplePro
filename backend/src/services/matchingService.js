// src/services/matchingService.js
const Driver = require('../models/Driver');
const Booking = require('../models/Booking');
const io = require('../sockets/socketHandler');

exports.assignDriver = async (bookingId) => {
  try {
    const booking = await Booking.findById(bookingId);
    if (!booking) throw new Error('Booking not found');

    const { pickupLocation, vehicleType } = booking;

    const nearestDriver = await Driver.findOneAndUpdate(
      {
        vehicleType: vehicleType,
        status: 'Available',
        location: {
          $near: {
            $geometry: {
              type: 'Point',
              coordinates: [pickupLocation.longitude, pickupLocation.latitude],
            },
            $maxDistance: 50000, // 50 km radius
          },
        },
      },
      { status: 'On Trip', currentBooking: booking._id },
      { sort: { location: 1 }, new: true }
    );

    if (!nearestDriver) {
      console.error('No available drivers found for booking:', bookingId);
      return;
    }

    // Update booking with driver information
    booking.driverId = nearestDriver._id;
    booking.status = 'Assigned';
    await booking.save();

    // Notify driver about the assignment
    io.to(nearestDriver._id.toString()).emit('newAssignment', { bookingId });

    console.log(`Driver ${nearestDriver._id} assigned to booking ${bookingId}`);
  } catch (error) {
    console.error('Error in assigning driver:', error);
  }
};
