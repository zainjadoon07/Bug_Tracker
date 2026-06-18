const { AuditLog, User, Bug, Project } = require('../Models');

exports.getBugAudits = async (req, res) => {
  try {
    const audits = await AuditLog.findAll({
      where: { bug_id: req.params.bugId },
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['user_id', 'name', 'role']
        }
      ],
      order: [['created_at', 'DESC']]
    });

    res.json(audits);
  } catch (error) {
    console.error('Get bug audits error:', error);
    res.status(500).json({ error: 'Internal server error retrieving bug audits' });
  }
};

exports.getRecentSystemAudits = async (req, res) => {
  try {
    const audits = await AuditLog.findAll({
      limit: 20,
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['user_id', 'name', 'role']
        },
        {
          model: Bug,
          as: 'bug',
          attributes: ['bug_id', 'title']
        },
        {
          model: Project,
          as: 'project',
          attributes: ['project_id', 'project_name']
        }
      ],
      order: [['created_at', 'DESC']]
    });

    res.json(audits);
  } catch (error) {
    console.error('Get system audits error:', error);
    res.status(500).json({ error: 'Internal server error retrieving recent activity logs' });
  }
};
