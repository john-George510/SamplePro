// backend/models/Booking.js

const mongoose = require('mongoose');

const BookingSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  pickupLocation: {
    type: {
      type: String,
      enum: ['Point'],
      default: 'Point',
      required: true,
    },
    coordinates: {
      type: [Number], // [longitude, latitude]
      required: true,
    },
  },
  dropoffLocation: {
    type: {
      type: String,
      enum: ['Point'],
      default: 'Point',
      required: true,
    },
    coordinates: {
      type: [Number], // [longitude, latitude]
      required: true,
    },
  },
  vehicleType: { type: String, enum: ['small', 'medium', 'large'], required: true },
  distance: { type: Number }, // in kilometers
  price: { type: Number }, // in USD
  status: { type: String, enum: ['Pending', 'Assigned', 'Completed'], default: 'Pending' },
  driver: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  createdAt: { type: Date, default: Date.now },
});

// Create a 2dsphere index on pickupLocation for geospatial queries
BookingSchema.index({ pickupLocation: '2dsphere' });

module.exports = mongoose.model('Booking', BookingSchema);
