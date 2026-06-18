const { DataTypes } = require('sequelize');
const { sequelize } = require('../db');

const Bug = sequelize.define('Bug', {
  bug_id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
    allowNull: false
  },
  project_id: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  title: {
    type: DataTypes.STRING,
    allowNull: false
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  priority: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      isIn: [['Low', 'Medium', 'High', 'Critical']]
    }
  },
  severity: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      isIn: [['Trivial', 'Minor', 'Major', 'Blocker']]
    }
  },
  status: {
    type: DataTypes.STRING,
    allowNull: false,
    defaultValue: 'Open',
    validate: {
      isIn: [['Open', 'Assigned', 'In Progress', 'Testing', 'Resolved', 'Closed']]
    }
  },
  reporter_id: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  assigned_user: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  created_at: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  },
  updated_at: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  }
}, {
  tableName: 'bugs',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});

module.exports = Bug;
