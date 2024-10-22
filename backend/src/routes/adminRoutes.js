const express = require('express');
const router = express.Router();
const {
  getAllBookings,
  getAllDrivers,
  getAllVehicles,
  addVehicle,
  updateVehicle,
  deleteVehicle,
} = require('../controllers/adminController');
const authMiddleware = require('../middleware/authMiddleware');

router.get('/bookings', authMiddleware, getAllBookings);
router.get('/drivers', authMiddleware, getAllDrivers);
router.get('/vehicles', authMiddleware, getAllVehicles);
router.post('/vehicles', authMiddleware, addVehicle);
router.put('/vehicles/:vehicleId', authMiddleware, updateVehicle);
router.delete('/vehicles/:vehicleId', authMiddleware, deleteVehicle);

module.exports = router;
