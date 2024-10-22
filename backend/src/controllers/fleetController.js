// src/controllers/fleetController.js
const Booking = require('../models/Booking');
const Driver = require('../models/Driver');
const Vehicle = require('../models/Vehicle');

exports.getAllBookings = async (req, res) => {
  try {
    const bookings = await Booking.find().populate('userId').populate('driverId');
    res.status(200).json(bookings);
  } catch (error) {
    console.error('Get All Bookings Error:', error);
    res.status(500).json({ message: 'Server Error' });
  }
};

exports.getAllDrivers = async (req, res) => {
  try {
    const drivers = await Driver.find().populate('vehicleId');
    res.status(200).json(drivers);
  } catch (error) {
    console.error('Get All Drivers Error:', error);
    res.status(500).json({ message: 'Server Error' });
  }
};

exports.getAllVehicles = async (req, res) => {
  try {
    const vehicles = await Vehicle.find();
    res.status(200).json(vehicles);
  } catch (error) {
    console.error('Get All Vehicles Error:', error);
    res.status(500).json({ message: 'Server Error' });
  }
};

exports.addVehicle = async (req, res) => {
  try {
    const vehicle = new Vehicle(req.body);
    await vehicle.save();
    res.status(201).json(vehicle);
  } catch (error) {
    console.error('Add Vehicle Error:', error);
    res.status(500).json({ message: 'Server Error' });
  }
};

exports.updateVehicle = async (req, res) => {
  try {
    const { vehicleId } = req.params;
    const updatedVehicle = await Vehicle.findByIdAndUpdate(vehicleId, req.body, { new: true });
    if (!updatedVehicle) {
      return res.status(404).json({ message: 'Vehicle not found' });
    }
    res.status(200).json(updatedVehicle);
  } catch (error) {
    console.error('Update Vehicle Error:', error);
    res.status(500).json({ message: 'Server Error' });
  }
};

exports.deleteVehicle = async (req, res) => {
  try {
    const { vehicleId } = req.params;
    await Vehicle.findByIdAndDelete(vehicleId);
    res.status(204).send();
  } catch (error) {
    console.error('Delete Vehicle Error:', error);
    res.status(500).json({ message: 'Server Error' });
  }
};
