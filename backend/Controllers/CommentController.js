const { Comment, User } = require('../Models');

exports.addComment = async (req, res) => {
  try {
    const { message } = req.body;
    const bug_id = req.params.bugId;

    if (!message) {
      return res.status(400).json({ error: 'Comment message is required' });
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
