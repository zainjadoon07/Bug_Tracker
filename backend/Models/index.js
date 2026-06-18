const { sequelize } = require('../db');
const User = require('./User');
const Project = require('./Project');
const Bug = require('./Bug');
const Comment = require('./Comment');

// Users & Projects
User.hasMany(Project, { foreignKey: 'owner_id', as: 'projects' });
Project.belongsTo(User, { foreignKey: 'owner_id', as: 'owner' });

// Projects & Bugs
Project.hasMany(Bug, { foreignKey: 'project_id', as: 'bugs', onDelete: 'CASCADE' });
Bug.belongsTo(Project, { foreignKey: 'project_id', as: 'project' });

// Users & Bugs (Reporter)
User.hasMany(Bug, { foreignKey: 'reporter_id', as: 'reportedBugs' });
Bug.belongsTo(User, { foreignKey: 'reporter_id', as: 'reporter' });

// Users & Bugs (Assignee)
User.hasMany(Bug, { foreignKey: 'assigned_user', as: 'assignedBugs' });
Bug.belongsTo(User, { foreignKey: 'assigned_user', as: 'assignee' });

// Bugs & Comments
Bug.hasMany(Comment, { foreignKey: 'bug_id', as: 'comments', onDelete: 'CASCADE' });
Comment.belongsTo(Bug, { foreignKey: 'bug_id', as: 'bug' });

// Users & Comments
User.hasMany(Comment, { foreignKey: 'user_id', as: 'userComments' });
Comment.belongsTo(User, { foreignKey: 'user_id', as: 'user' });

module.exports = {
  sequelize,
  User,
  Project,
  Bug,
  Comment
};
