const Booking = require('../models/Booking');
const Driver = require('../models/Driver');
const Vehicle = require('../models/Vehicle');

exports.getAllBookings = async (req, res) => {
  try {
    const bookings = await Booking.find();
    res.json(bookings);
  } catch (error) {
    res.status(500).json({ msg: error.message });
  }
};

exports.getAllDrivers = async (req, res) => {
  try {
    const drivers = await Driver.find();
    res.json(drivers);
  } catch (error) {
    res.status(500).json({ msg: error.message });
  }
};

exports.getAllVehicles = async (req, res) => {
  try {
    const vehicles = await Vehicle.find();
    res.json(vehicles);
  } catch (error) {
    res.status(500).json({ msg: error.message });
  }
};

exports.addVehicle = async (req, res) => {
  try {
    const vehicle = new Vehicle(req.body);
    await vehicle.save();
    res.json(vehicle);
  } catch (error) {
    res.status(500).json({ msg: error.message });
  }
};

exports.updateVehicle = async (req, res) => {
  try {
    const vehicleId = req.params.vehicleId;
    const updatedVehicle = await Vehicle.findByIdAndUpdate(vehicleId, req.body, { new: true });
    res.json(updatedVehicle);
  } catch (error) {
    res.status(500).json({ msg: error.message });
  }
};

exports.deleteVehicle = async (req, res) => {
  try {
    const vehicleId = req.params.vehicleId;
    await Vehicle.findByIdAndDelete(vehicleId);
    res.json({ msg: 'Vehicle deleted' });
  } catch (error) {
    res.status(500).json({ msg: error.message });
  }
};
