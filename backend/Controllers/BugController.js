const { Bug, Project, User } = require('../Models');
const { Op } = require('sequelize');

exports.createBug = async (req, res) => {
  try {
    const { project_id, title, description, priority, severity, trackable_by_all } = req.body;

    if (!project_id || !title || !description || !priority || !severity) {
      return res.status(400).json({ error: 'All fields (project_id, title, description, priority, severity) are required' });
    }

    // Verify project exists
    const project = await Project.findByPk(project_id);
    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }

    const bug = await Bug.create({
      project_id,
      title,
      description,
      priority,
      severity,
      status: 'Open',
      reporter_id: req.user.user_id,
      trackable_by_all: trackable_by_all || false
    });

    res.status(201).json({
      message: 'Bug reported successfully',
      bug
    });
  } catch (error) {
    console.error('Create bug error:', error);
    res.status(500).json({ error: 'Internal server error creating bug' });
  }
};

exports.getBugs = async (req, res) => {
  try {
    const { project_id, status, assigned_user, priority, deleted } = req.query;
    const filter = {};

    if (project_id) filter.project_id = project_id;
    if (status) filter.status = status;
    if (assigned_user) filter.assigned_user = assigned_user;
    if (priority) filter.priority = priority;

    const showDeleted = deleted === 'true';
    filter.deleted_at = showDeleted ? { [Op.ne]: null } : null;

    const bugs = await Bug.findAll({
      where: filter,
      include: [
        {
          model: Project,
          as: 'project',
          attributes: ['project_id', 'project_name']
        },
        {
          model: User,
          as: 'reporter',
          attributes: ['user_id', 'name', 'email', 'role']
        },
        {
          model: User,
          as: 'assignee',
          attributes: ['user_id', 'name', 'email', 'role']
        }
      ],
      order: [['created_at', 'DESC']]
    });

    res.json(bugs);
  } catch (error) {
    console.error('Get bugs error:', error);
    res.status(500).json({ error: 'Internal server error retrieving bugs' });
  }
};

exports.getBugById = async (req, res) => {
  try {
    const bug = await Bug.findByPk(req.params.id, {
      include: [
        {
          model: Project,
          as: 'project',
          attributes: ['project_id', 'project_name']
        },
        {
          model: User,
          as: 'reporter',
          attributes: ['user_id', 'name', 'email']
        },
        {
          model: User,
          as: 'assignee',
          attributes: ['user_id', 'name', 'email']
        }
      ]
    });

    if (!bug) {
      return res.status(404).json({ error: 'Bug report not found' });
    }

    res.json(bug);
  } catch (error) {
    console.error('Get bug by ID error:', error);
    res.status(500).json({ error: 'Internal server error retrieving bug details' });
  }
};

exports.updateBug = async (req, res) => {
  try {
    const bug = await Bug.findByPk(req.params.id);

    if (!bug) {
      return res.status(404).json({ error: 'Bug report not found' });
    }

    const { title, description, priority, severity, status, assigned_user, trackable_by_all } = req.body;
    const { role, user_id } = req.user;

    // Role-based validations
    if (bug.status === 'Closed' && role !== 'Administrator') {
      return res.status(403).json({ error: 'Closed bugs can only be reopened or updated by Administrators.' });
    }

    const finalTrackable = (trackable_by_all !== undefined) ? trackable_by_all : bug.trackable_by_all;

    // Enforce assignee requirements for status transitions (unless trackable by all)
    if (status && !finalTrackable) {
      const finalAssignee = (assigned_user !== undefined) ? assigned_user : bug.assigned_user;
      
      // 1. Unassigned bugs cannot change status to anything other than Open (or Assigned if assignment is being set in this request)
      if (status !== 'Open' && status !== 'Assigned' && !finalAssignee) {
        return res.status(400).json({ error: 'Status can only be updated once a developer/tester is assigned.' });
      }

      // 2. Unassigned bugs cannot be closed or resolved
      if ((status === 'Closed' || status === 'Resolved') && !finalAssignee) {
        return res.status(400).json({ error: 'Unassigned bugs cannot be closed or resolved. An assignee must be assigned first.' });
      }

      // 3. Testers cannot update status
      if (role === 'Tester') {
        return res.status(403).json({ error: 'Testers are not authorized to update bug status.' });
      }

      // 4. Developers can only update status if they are the assignee
      if (role === 'Developer') {
        if (bug.assigned_user !== user_id) {
          return res.status(403).json({ error: 'Only the assigned Developer can update this bug status.' });
        }
      }
    }

    if (role === 'Developer') {
      // Developers can assign to themselves or update status, but not edit reporter data, priority, etc.
      if (title || description || priority || severity) {
        return res.status(403).json({ error: 'Developers are only authorized to update bug status and assignment.' });
      }

      // If they update assignment, it must be assigned to themselves
      if (assigned_user && parseInt(assigned_user) !== user_id) {
        return res.status(403).json({ error: 'Developers can only assign bugs to themselves.' });
      }
    }

    if (role === 'Tester') {
      // Testers can assign to themselves, but not others
      if (assigned_user && parseInt(assigned_user) !== user_id) {
        return res.status(403).json({ error: 'Testers can only assign bugs to themselves.' });
      }
    }

    // Apply valid status transitions or check values
    if (status) {
      const validStatuses = ['Open', 'Assigned', 'In Progress', 'Testing', 'Resolved', 'Closed'];
      if (!validStatuses.includes(status)) {
        return res.status(400).json({ error: `Invalid status: ${status}` });
      }
      bug.status = status;
    }

    if (title !== undefined) bug.title = title;
    if (description !== undefined) bug.description = description;
    if (priority !== undefined) bug.priority = priority;
    if (severity !== undefined) bug.severity = severity;
    if (assigned_user !== undefined) bug.assigned_user = assigned_user;
    if (trackable_by_all !== undefined) bug.trackable_by_all = trackable_by_all;

    bug.updated_at = new Date();
    await bug.save();

    // Re-fetch with associations
    const updatedBug = await Bug.findByPk(bug.bug_id, {
      include: [
        { model: Project, as: 'project', attributes: ['project_name'] },
        { model: User, as: 'reporter', attributes: ['name', 'email'] },
        { model: User, as: 'assignee', attributes: ['name', 'email'] }
      ]
    });

    res.json({
      message: 'Bug updated successfully',
      bug: updatedBug
    });
  } catch (error) {
    console.error('Update bug error:', error);
    res.status(500).json({ error: 'Internal server error updating bug' });
  }
};

exports.softDeleteBug = async (req, res) => {
  try {
    if (req.user.role !== 'Administrator') {
      return res.status(403).json({ error: 'Only Administrators can delete bugs' });
    }

    const bug = await Bug.findByPk(req.params.id);
    if (!bug) {
      return res.status(404).json({ error: 'Bug report not found' });
    }

    if (bug.deleted_at !== null) {
      return res.status(400).json({ error: 'Bug is already deleted' });
    }

    bug.deleted_at = new Date();
    await bug.save();

    res.json({ message: 'Bug soft-deleted successfully', bug });
  } catch (error) {
    console.error('Soft delete bug error:', error);
    res.status(500).json({ error: 'Internal server error deleting bug' });
  }
};

exports.restoreBug = async (req, res) => {
  try {
    if (req.user.role !== 'Administrator') {
      return res.status(403).json({ error: 'Only Administrators can restore bugs' });
    }

    const bug = await Bug.findByPk(req.params.id);
    if (!bug) {
      return res.status(404).json({ error: 'Bug report not found' });
    }

    if (bug.deleted_at === null) {
      return res.status(400).json({ error: 'Bug is not deleted' });
    }

    bug.deleted_at = null;
    await bug.save();

    res.json({ message: 'Bug restored successfully', bug });
  } catch (error) {
    console.error('Restore bug error:', error);
    res.status(500).json({ error: 'Internal server error restoring bug' });
  }
};

exports.permanentlyDeleteBug = async (req, res) => {
  try {
    if (req.user.role !== 'Administrator') {
      return res.status(403).json({ error: 'Only Administrators can permanently delete bugs' });
    }

    const bug = await Bug.findByPk(req.params.id);
    if (!bug) {
      return res.status(404).json({ error: 'Bug report not found' });
    }

    await bug.destroy();
    res.json({ message: 'Bug permanently deleted' });
  } catch (error) {
    console.error('Permanent delete bug error:', error);
    res.status(500).json({ error: 'Internal server error purging bug' });
  }
};
