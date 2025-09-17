const { DataTypes } = require('sequelize');
const sequelize = require('../database/connection');

const OvernightList = sequelize.define('OvernightList', {
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
  dayNumber: {
    type: DataTypes.INTEGER,
    allowNull: false,
    field: 'day_number'
  },
  date: {
    type: DataTypes.DATEONLY,
    allowNull: true
  },
  location: {
    type: DataTypes.STRING(200),
    allowNull: true
  },
  accommodation: {
    type: DataTypes.STRING(200),
    allowNull: true
  },
  accommodationType: {
    type: DataTypes.ENUM('camping', 'dorm', 'twin', 'single', 'family', 'luxury'),
    allowNull: true,
    field: 'accommodation_type'
  },
  paxCount: {
    type: DataTypes.INTEGER,
    allowNull: true,
    field: 'pax_count'
  },
  roomConfiguration: {
    type: DataTypes.STRING(100),
    allowNull: true,
    field: 'room_configuration'
  },
  mealsBreakfast: {
    type: DataTypes.ENUM('x', '0', '1'),
    allowNull: true,
    field: 'meals_breakfast'
  },
  mealsLunch: {
    type: DataTypes.ENUM('x', '0', '1'),
    allowNull: true,
    field: 'meals_lunch'
  },
  mealsDinner: {
    type: DataTypes.ENUM('x', '0', '1'),
    allowNull: true,
    field: 'meals_dinner'
  },
  activities: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  supplier: {
    type: DataTypes.STRING(200),
    allowNull: true
  },
  bookingReference: {
    type: DataTypes.STRING(100),
    allowNull: true,
    field: 'booking_reference'
  },
  status: {
    type: DataTypes.ENUM('provisional', 'confirmed', 'waitlisted', 'alternative', 'cancelled'),
    allowNull: false,
    defaultValue: 'provisional'
  },
  notes: {
    type: DataTypes.TEXT,
    allowNull: true
  }
}, {
  tableName: 'overnight_lists',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});

// Associations
OvernightList.associate = (models) => {
  OvernightList.belongsTo(models.Tour, { foreignKey: 'tourId', as: 'tour' });
};

module.exports = OvernightList;
