const express = require('express');
const router = express.Router();
const auditController = require('../Controllers/AuditController');
const { authenticateToken } = require('../Middleware/authMiddleware');

router.get('/bug/:bugId', authenticateToken, auditController.getBugAudits);
router.get('/recent', authenticateToken, auditController.getRecentSystemAudits);

module.exports = router;
