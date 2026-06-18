const { Comment, User, Bug, AuditLog } = require('../Models');

exports.addComment = async (req, res) => {
  try {
    const { message } = req.body;
    const bug_id = req.params.bugId;

    if (!message) {
      return res.status(400).json({ error: 'Comment message is required' });
    }

    const bug = await Bug.findByPk(bug_id);
    if (!bug) {
      return res.status(404).json({ error: 'Associated bug not found' });
    }
    if (bug.status === 'Closed') {
      return res.status(400).json({ error: 'Comments are disabled on closed bugs.' });
    }

    const comment = await Comment.create({
      bug_id: parseInt(bug_id),
      user_id: req.user.user_id,
      message
    });

    const populatedComment = await Comment.findByPk(comment.comment_id, {
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['user_id', 'name', 'email', 'role']
        }
      ]
    });

    // Create Audit Log
    try {
      await AuditLog.create({
        bug_id: bug.bug_id,
        project_id: bug.project_id,
        user_id: req.user.user_id,
        action_type: 'COMMENT_ADDED',
        details: JSON.stringify({ title: bug.title, comment_message: message.substring(0, 60) })
      });
    } catch (auditErr) {
      console.error('Audit logging failed for COMMENT_ADDED:', auditErr);
    }

    res.status(201).json({
      message: 'Comment added successfully',
      comment: populatedComment
    });
  } catch (error) {
    console.error('Add comment error:', error);
    res.status(500).json({ error: 'Internal server error adding comment' });
  }
};

exports.getComments = async (req, res) => {
  try {
    const bug_id = req.params.bugId;

    const comments = await Comment.findAll({
      where: { bug_id: parseInt(bug_id) },
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['user_id', 'name', 'email', 'role']
        }
      ],
      order: [['created_at', 'ASC']]
    });

    res.json(comments);
  } catch (error) {
    console.error('Get comments error:', error);
    res.status(500).json({ error: 'Internal server error retrieving comments' });
  }
};

exports.updateComment = async (req, res) => {
  try {
    const { message } = req.body;
    if (!message) {
      return res.status(400).json({ error: 'Comment message is required' });
    }

    const comment = await Comment.findByPk(req.params.commentId);
    if (!comment) {
      return res.status(404).json({ error: 'Comment not found' });
    }

    // Only comment authors and Administrators can edit their comment
    if (comment.user_id !== req.user.user_id && req.user.role !== 'Administrator') {
      return res.status(403).json({ error: 'You are not authorized to edit this comment' });
    }

    comment.message = message;
    comment.updated_at = new Date();
    await comment.save();

    const populatedComment = await Comment.findByPk(comment.comment_id, {
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['user_id', 'name', 'email', 'role']
        }
      ]
    });

    res.json({
      message: 'Comment updated successfully',
      comment: populatedComment
    });
  } catch (error) {
    console.error('Update comment error:', error);
    res.status(500).json({ error: 'Internal server error updating comment' });
  }
};

exports.deleteComment = async (req, res) => {
  try {
    const comment = await Comment.findByPk(req.params.commentId);
    if (!comment) {
      return res.status(404).json({ error: 'Comment not found' });
    }

    // Comment author or Administrator can delete
    if (comment.user_id !== req.user.user_id && req.user.role !== 'Administrator') {
      return res.status(403).json({ error: 'You are not authorized to delete this comment' });
    }

    const bug = await Bug.findByPk(comment.bug_id);
    const author = await User.findByPk(comment.user_id);
    const authorName = author ? author.name : 'Unknown';

    await comment.destroy();

    // Create Audit Log
    if (bug) {
      try {
        await AuditLog.create({
          bug_id: bug.bug_id,
          project_id: bug.project_id,
          user_id: req.user.user_id,
          action_type: 'COMMENT_DELETED',
          details: JSON.stringify({
            title: bug.title,
            comment_message: comment.message.substring(0, 60),
            author_name: authorName
          })
        });
      } catch (auditErr) {
        console.error('Audit logging failed for COMMENT_DELETED:', auditErr);
      }
    }

    res.json({ message: 'Comment deleted successfully' });
  } catch (error) {
    console.error('Delete comment error:', error);
    res.status(500).json({ error: 'Internal server error deleting comment' });
  }
};
