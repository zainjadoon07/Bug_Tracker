const { sequelize } = require('../db');
const User = require('./User');
const Project = require('./Project');
const Bug = require('./Bug');
const Comment = require('./Comment');
const AuditLog = require('./AuditLog');

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

// Audit Logs associations
User.hasMany(AuditLog, { foreignKey: 'user_id', as: 'auditLogs' });
AuditLog.belongsTo(User, { foreignKey: 'user_id', as: 'user' });

Bug.hasMany(AuditLog, { foreignKey: 'bug_id', as: 'auditLogs', onDelete: 'CASCADE' });
AuditLog.belongsTo(Bug, { foreignKey: 'bug_id', as: 'bug' });

Project.hasMany(AuditLog, { foreignKey: 'project_id', as: 'auditLogs', onDelete: 'CASCADE' });
AuditLog.belongsTo(Project, { foreignKey: 'project_id', as: 'project' });

module.exports = {
  sequelize,
  User,
  Project,
  Bug,
  Comment,
  AuditLog
};
