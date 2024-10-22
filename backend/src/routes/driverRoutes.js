const express = require('express');
const router = express.Router();
const { getAssignments } = require('../controllers/driverController');
const authMiddleware = require('../middleware/authMiddleware');

router.get('/assignments', authMiddleware, getAssignments);

module.exports = router;
