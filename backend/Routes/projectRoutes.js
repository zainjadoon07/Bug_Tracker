const express = require('express');
const router = express.Router();
const projectController = require('../Controllers/ProjectController');
const { authenticateToken, authorizeRoles } = require('../Middleware/authMiddleware');

router.post('/', authenticateToken, authorizeRoles('Administrator'), projectController.createProject);
router.get('/', authenticateToken, projectController.getProjects);

// Administrator operations
router.put('/:id', authenticateToken, authorizeRoles('Administrator'), projectController.updateProject);
router.delete('/:id', authenticateToken, authorizeRoles('Administrator'), projectController.softDeleteProject);
router.put('/:id/restore', authenticateToken, authorizeRoles('Administrator'), projectController.restoreProject);
router.delete('/:id/permanent', authenticateToken, authorizeRoles('Administrator'), projectController.permanentlyDeleteProject);

module.exports = router;
