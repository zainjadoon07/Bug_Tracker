const express = require('express');
const router = express.Router();
const commentController = require('../Controllers/CommentController');
const { authenticateToken } = require('../Middleware/authMiddleware');

router.post('/:bugId', authenticateToken, commentController.addComment);
router.get('/:bugId', authenticateToken, commentController.getComments);

module.exports = router;
