const express = require('express');
const router = express.Router();
const projectController = require('../Controllers/ProjectController');
const { authenticateToken, authorizeRoles } = require('../Middleware/authMiddleware');

router.post('/', authenticateToken, authorizeRoles('Administrator'), projectController.createProject);
router.get('/', authenticateToken, projectController.getProjects);

module.exports = router;
