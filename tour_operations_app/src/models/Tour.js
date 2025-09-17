const { DataTypes } = require('sequelize');
const sequelize = require('../database/connection');

const Tour = sequelize.define('Tour', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  tourCode: {
    type: DataTypes.STRING(20),
    allowNull: false,
    unique: true,
    field: 'tour_code'
  },
  categoryId: {
    type: DataTypes.INTEGER,
    allowNull: true,
    field: 'category_id'
  },
  agentId: {
    type: DataTypes.INTEGER,
    allowNull: true,
    field: 'agent_id'
  },
  consultantId: {
    type: DataTypes.INTEGER,
    allowNull: true,
    field: 'consultant_id'
  },
  title: {
    type: DataTypes.STRING(200),
    allowNull: false
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  startDate: {
    type: DataTypes.DATEONLY,
    allowNull: true,
    field: 'start_date'
  },
  endDate: {
    type: DataTypes.DATEONLY,
    allowNull: true,
    field: 'end_date'
  },
  durationDays: {
    type: DataTypes.INTEGER,
    allowNull: true,
    field: 'duration_days'
  },
  maxPax: {
    type: DataTypes.INTEGER,
    allowNull: true,
    field: 'max_pax'
  },
  confirmedPax: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0,
    field: 'confirmed_pax'
  },
  status: {
    type: DataTypes.ENUM('quote', 'provisional', 'confirmed', 'cancelled'),
    allowNull: false,
    defaultValue: 'quote'
  },
  currency: {
    type: DataTypes.STRING(3),
    allowNull: false,
    defaultValue: 'ZAR'
  },
  exchangeRate: {
    type: DataTypes.DECIMAL(10, 4),
    allowNull: true,
    field: 'exchange_rate'
  },
  totalCost: {
    type: DataTypes.DECIMAL(12, 2),
    allowNull: true,
    field: 'total_cost'
  },
  depositAmount: {
    type: DataTypes.DECIMAL(12, 2),
    allowNull: true,
    field: 'deposit_amount'
  },
  finalPaymentDue: {
    type: DataTypes.DATEONLY,
    allowNull: true,
    field: 'final_payment_due'
  },
  specialRequirements: {
    type: DataTypes.TEXT,
    allowNull: true,
    field: 'special_requirements'
  }
}, {
  tableName: 'tours',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});

// Associations
Tour.associate = (models) => {
  Tour.belongsTo(models.Agent, { foreignKey: 'agentId', as: 'agent' });
  Tour.belongsTo(models.User, { foreignKey: 'consultantId', as: 'consultant' });
  Tour.belongsTo(models.TourCategory, { foreignKey: 'categoryId', as: 'category' });
  Tour.hasMany(models.Quote, { foreignKey: 'tourId', as: 'quotes' });
  Tour.hasMany(models.Booking, { foreignKey: 'tourId', as: 'bookings' });
  Tour.hasMany(models.OvernightList, { foreignKey: 'tourId', as: 'overnightLists' });
  Tour.hasMany(models.Invoice, { foreignKey: 'tourId', as: 'invoices' });
  Tour.hasMany(models.BookingChecklist, { foreignKey: 'tourId', as: 'checklists' });
  Tour.hasMany(models.TourCrew, { foreignKey: 'tourId', as: 'crew' });
  Tour.hasMany(models.TourEquipment, { foreignKey: 'tourId', as: 'equipment' });
};

module.exports = Tour;
