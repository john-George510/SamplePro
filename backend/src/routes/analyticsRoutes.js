// src/routes/analyticsRoutes.js
const express = require('express');
const { getTripStatistics } = require('../controllers/analyticsController');
const { authenticate, authorize } = require('../middleware/authMiddleware');

const router = express.Router();

// Apply authentication and admin authorization
router.use(authenticate);
router.use(authorize(['admin']));

router.get('/trip-stats', getTripStatistics);

module.exports = router;
