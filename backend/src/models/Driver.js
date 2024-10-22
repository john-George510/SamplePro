const mongoose = require('mongoose');

const DriverSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  status: { type: String, enum: ['Available', 'Busy'], default: 'Available' },
  location: {
    latitude: Number,
    longitude: Number,
  },
});

module.exports = mongoose.model('Driver', DriverSchema);
