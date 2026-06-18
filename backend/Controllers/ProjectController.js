const { Project, User } = require('../Models');

exports.createProject = async (req, res) => {
  try {
    const { project_name, description } = req.body;

    if (!project_name) {
      return res.status(400).json({ error: 'Project name is required' });
    }

    // Owner is the logged-in user (who must be an Administrator based on route guard)
    const project = await Project.create({
      project_name,
      description,
      owner_id: req.user.user_id
    });

    res.status(201).json({
      message: 'Project created successfully',
      project
    });
  } catch (error) {
    console.error('Create project error:', error);
    res.status(500).json({ error: 'Internal server error creating project' });
  }
};

exports.getProjects = async (req, res) => {
  try {
    const projects = await Project.findAll({
      include: [
        {
          model: User,
          as: 'owner',
          attributes: ['user_id', 'name', 'email']
        }
      ],
      order: [['created_at', 'DESC']]
    });
    res.json(projects);
  } catch (error) {
    console.error('Get projects error:', error);
    res.status(500).json({ error: 'Internal server error retrieving projects' });
  }
};
