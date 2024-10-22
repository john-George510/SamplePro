// src/routes/fleetRoutes.js
const express = require('express');
const {
  getAllBookings,
  getAllDrivers,
  getAllVehicles,
  addVehicle,
  updateVehicle,
  deleteVehicle,
} = require('../controllers/fleetController');
const { authenticate, authorize } = require('../middleware/authMiddleware');

const router = express.Router();

// Apply authentication and admin authorization
router.use(authenticate);
router.use(authorize(['admin']));

router.get('/bookings', getAllBookings);
router.get('/drivers', getAllDrivers);
router.get('/vehicles', getAllVehicles);
router.post('/vehicles', addVehicle);
router.put('/vehicles/:vehicleId', updateVehicle);
router.delete('/vehicles/:vehicleId', deleteVehicle);

module.exports = router;
