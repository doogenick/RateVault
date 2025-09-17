const { DataTypes } = require('sequelize');
const sequelize = require('../database/connection');

const QuoteItem = sequelize.define('QuoteItem', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  quoteId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    field: 'quote_id'
  },
  dayNumber: {
    type: DataTypes.INTEGER,
    allowNull: true,
    field: 'day_number'
  },
  serviceType: {
    type: DataTypes.ENUM('accommodation', 'activity', 'transport', 'meal', 'park_fee', 'other'),
    allowNull: false,
    field: 'service_type'
  },
  serviceName: {
    type: DataTypes.STRING(200),
    allowNull: false,
    field: 'service_name'
  },
  supplier: {
    type: DataTypes.STRING(200),
    allowNull: true
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  unitPrice: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true,
    field: 'unit_price'
  },
  quantity: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 1
  },
  totalPrice: {
    type: DataTypes.DECIMAL(12, 2),
    allowNull: true,
    field: 'total_price'
  },
  isIncluded: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: true,
    field: 'is_included'
  },
  notes: {
    type: DataTypes.TEXT,
    allowNull: true
  }
}, {
  tableName: 'quote_items',
  timestamps: false
});

// Associations
QuoteItem.associate = (models) => {
  QuoteItem.belongsTo(models.Quote, { foreignKey: 'quoteId', as: 'quote' });
};

module.exports = QuoteItem;
