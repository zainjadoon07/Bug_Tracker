const express = require('express');
const router = express.Router();
const authController = require('../Controllers/AuthController');
const { authenticateToken } = require('../Middleware/authMiddleware');

router.post('/register', authController.register);
router.post('/login', authController.login);
router.get('/users', authenticateToken, authController.getUsers);

module.exports = router;
