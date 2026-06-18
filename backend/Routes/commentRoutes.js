const express = require('express');
const router = express.Router();
const commentController = require('../Controllers/CommentController');
const { authenticateToken, authorizeRoles } = require('../Middleware/authMiddleware');

router.post('/:bugId', authenticateToken, commentController.addComment);
router.get('/:bugId', authenticateToken, commentController.getComments);
router.delete('/:commentId', authenticateToken, authorizeRoles('Administrator'), commentController.deleteComment);

module.exports = router;
