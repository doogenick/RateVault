const { DataTypes } = require('sequelize');
const sequelize = require('../database/connection');

const BookingChecklist = sequelize.define('BookingChecklist', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  tourId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    field: 'tour_id'
  },
  checklistType: {
    type: DataTypes.ENUM('pre_tour', 'during_tour', 'post_tour', 'booking', 'payment', 'supplier'),
    allowNull: false,
    field: 'checklist_type'
  },
  itemName: {
    type: DataTypes.STRING(200),
    allowNull: false,
    field: 'item_name'
  },
  isCompleted: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false,
    field: 'is_completed'
  },
  completedBy: {
    type: DataTypes.INTEGER,
    allowNull: true,
    field: 'completed_by'
  },
  completedAt: {
    type: DataTypes.DATE,
    allowNull: true,
    field: 'completed_at'
  },
  dueDate: {
    type: DataTypes.DATEONLY,
    allowNull: true,
    field: 'due_date'
  },
  priority: {
    type: DataTypes.ENUM('low', 'medium', 'high', 'critical'),
    allowNull: false,
    defaultValue: 'medium'
  },
  notes: {
    type: DataTypes.TEXT,
    allowNull: true
  }
}, {
  tableName: 'booking_checklists',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});

// Associations
BookingChecklist.associate = (models) => {
  BookingChecklist.belongsTo(models.Tour, { foreignKey: 'tourId', as: 'tour' });
  BookingChecklist.belongsTo(models.User, { foreignKey: 'completedBy', as: 'completedByUser' });
};

module.exports = BookingChecklist;
