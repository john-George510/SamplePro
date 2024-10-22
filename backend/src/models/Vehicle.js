const mongoose = require('mongoose');

const VehicleSchema = new mongoose.Schema({
  type: String,
  licensePlate: String,
  capacity: Number,
});

module.exports = mongoose.model('Vehicle', VehicleSchema);
