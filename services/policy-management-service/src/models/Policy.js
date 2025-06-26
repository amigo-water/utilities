const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Policy = sequelize.define('Policy', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  external_id: {
    type: DataTypes.STRING(50)
  },
  name: {
    type: DataTypes.STRING(255),
    allowNull: false
  },
  description: {
    type: DataTypes.TEXT
  },
  effective_from: {
    type: DataTypes.DATE,
    allowNull: false
  },
  effective_to: {
    type: DataTypes.DATE
  },
  version: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  status: {
    type: DataTypes.STRING(50),
    allowNull: false
  },
  approval_status: {
    type: DataTypes.STRING(50)
  },
  category_id: {
    type: DataTypes.UUID,
    references: {
      model: 'policy_categories',
      key: 'id'
    }
  },
  utility_type_id: {
    type: DataTypes.UUID
  },
  created_by: {
    type: DataTypes.UUID,
    allowNull: false
  },
  approved_by: {
    type: DataTypes.UUID
  },
  metadata: {
    type: DataTypes.JSONB
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
  tableName: 'policies',
  timestamps: true, 
  underscored: true, 
  createdAt: 'created_at', 
  updatedAt: 'updated_at'  
});

module.exports = Policy; 