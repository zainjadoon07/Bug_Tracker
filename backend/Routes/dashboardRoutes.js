const express = require('express');
const router = express.Router();
const dashboardController = require('../Controllers/DashboardController');
const { authenticateToken } = require('../Middleware/authMiddleware');

router.get('/stats', authenticateToken, dashboardController.getStats);

module.exports = router;
