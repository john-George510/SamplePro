const mongoose = require('mongoose');

const BookingSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  company_name: { type: String, required: true },
  status: { type: String, enum: ['Pending', 'Assigned', 'Completed'], default: 'Pending' },
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
  lorry_type: { type: String, enum: ['small', 'medium', 'large'], required: true },
  quantity: { type: Number, required: true },
  distance: { type: Number }, // in kilometers
  material_type: { type: String, required: true },
  price_per_tonne: { type: Number, required: true },
  expected_amount: { type: Number, required: true },
  insurance_supported: { type: Boolean, default: false },
  expiration_time: { type: Date, required: true }, // Changed from expiration_time
  price: { type: Number }, // in USD
  driver: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  refrigeration_required: { type: Boolean, default: false }, // Added refrigeration requirement
  fragile: { type: Boolean, default: false }, // Added fragile handling requirement
  createdAt: { type: Date, default: Date.now },
  // Add fields for combined routes
  isCombinedRoute: {
    type: Boolean,
    default: false
  },
  combinedBookings: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Booking'
  }],
  routeOrder: [{
    location: {
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
    stopType: {
      type: String,
      enum: ['pickup', 'dropoff']
    },
    order: Number
  }],
  combinedPrice: {
    type: Number
  }
});

// Create a 2dsphere index on pickupLocation for geospatial queries
BookingSchema.index({ pickupLocation: '2dsphere' });

module.exports = mongoose.model('Booking', BookingSchema);