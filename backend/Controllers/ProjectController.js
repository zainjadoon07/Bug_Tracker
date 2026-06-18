const { Project, User, Bug, AuditLog } = require('../Models');
const { Op } = require('sequelize');

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
    const showDeleted = req.query.deleted === 'true';
    const projects = await Project.findAll({
      where: {
        deleted_at: showDeleted ? { [Op.ne]: null } : null
      },
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

exports.updateProject = async (req, res) => {
  try {
    const { project_name, description } = req.body;
    const project = await Project.findByPk(req.params.id);

    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }

    if (project.deleted_at !== null) {
      return res.status(400).json({ error: 'Cannot modify a deleted project.' });
    }

    if (project_name !== undefined) {
      if (!project_name.trim()) {
        return res.status(400).json({ error: 'Project name cannot be empty' });
      }
      project.project_name = project_name;
    }
    if (description !== undefined) {
      project.description = description;
    }

    await project.save();

    res.json({
      message: 'Project updated successfully',
      project
    });
  } catch (error) {
    console.error('Update project error:', error);
    res.status(500).json({ error: 'Internal server error updating project' });
  }
};

exports.softDeleteProject = async (req, res) => {
  try {
    const project = await Project.findByPk(req.params.id);

    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }

    if (project.deleted_at !== null) {
      return res.status(400).json({ error: 'Project is already deleted' });
    }

    project.deleted_at = new Date();
    await project.save();

    // Archive all bugs associated with this project (except Closed ones)
    await Bug.update(
      { status: 'Archived' },
      { where: { project_id: project.project_id, status: { [Op.ne]: 'Closed' } } }
    );

    // Create Audit Log
    try {
      await AuditLog.create({
        bug_id: null,
        project_id: project.project_id,
        user_id: req.user.user_id,
        action_type: 'PROJECT_DELETED',
        details: JSON.stringify({
          project_name: project.project_name,
          message: `Project "${project.project_name}" was soft-deleted, archiving all associated bugs.`
        })
      });
    } catch (auditErr) {
      console.error('Audit logging failed for PROJECT_DELETED:', auditErr);
    }

    res.json({
      message: 'Project soft-deleted successfully and associated bugs archived.',
      project
    });
  } catch (error) {
    console.error('Soft delete project error:', error);
    res.status(500).json({ error: 'Internal server error deleting project' });
  }
};

exports.restoreProject = async (req, res) => {
  try {
    const project = await Project.findByPk(req.params.id);

    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }

    if (project.deleted_at === null) {
      return res.status(400).json({ error: 'Project is not deleted' });
    }

    project.deleted_at = null;
    await project.save();

    res.json({
      message: 'Project restored successfully',
      project
    });
  } catch (error) {
    console.error('Restore project error:', error);
    res.status(500).json({ error: 'Internal server error restoring project' });
  }
};

exports.permanentlyDeleteProject = async (req, res) => {
  try {
    const project = await Project.findByPk(req.params.id);

    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }

    // Archive all bugs associated with this project (except Closed ones)
    await Bug.update(
      { status: 'Archived' },
      { where: { project_id: project.project_id, status: { [Op.ne]: 'Closed' } } }
    );

    // Create Audit Log
    try {
      await AuditLog.create({
        bug_id: null,
        project_id: project.project_id,
        user_id: req.user.user_id,
        action_type: 'PROJECT_PURGED',
        details: JSON.stringify({
          project_name: project.project_name,
          message: `Project "${project.project_name}" was permanently deleted (purged), archiving all associated bugs.`
        })
      });
    } catch (auditErr) {
      console.error('Audit logging failed for PROJECT_PURGED:', auditErr);
    }

    await project.destroy();

    res.json({
      message: 'Project permanently deleted and associated bugs archived.'
    });
  } catch (error) {
    console.error('Permanent delete project error:', error);
    res.status(500).json({ error: 'Internal server error purging project' });
  }
};
