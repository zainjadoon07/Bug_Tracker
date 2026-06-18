const express = require('express');
const router = express.Router();
const bugController = require('../Controllers/BugController');
const { authenticateToken, authorizeRoles } = require('../Middleware/authMiddleware');

router.post('/', authenticateToken, authorizeRoles('Tester'), bugController.createBug);
router.get('/', authenticateToken, bugController.getBugs);
router.get('/:id', authenticateToken, bugController.getBugById);
router.put('/:id', authenticateToken, bugController.updateBug);

// Admin-only bug routes
router.delete('/:id', authenticateToken, authorizeRoles('Administrator'), bugController.softDeleteBug);
router.put('/:id/restore', authenticateToken, authorizeRoles('Administrator'), bugController.restoreBug);
router.delete('/:id/permanent', authenticateToken, authorizeRoles('Administrator'), bugController.permanentlyDeleteBug);

module.exports = router;
