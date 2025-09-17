const { DataTypes } = require('sequelize');
const sequelize = require('../database/connection');

const Quote = sequelize.define('Quote', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  quoteNumber: {
    type: DataTypes.STRING(20),
    allowNull: false,
    unique: true,
    field: 'quote_number'
  },
  tourId: {
    type: DataTypes.INTEGER,
    allowNull: true,
    field: 'tour_id'
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
  quoteDate: {
    type: DataTypes.DATEONLY,
    allowNull: false,
    field: 'quote_date'
  },
  validUntil: {
    type: DataTypes.DATEONLY,
    allowNull: true,
    field: 'valid_until'
  },
  status: {
    type: DataTypes.ENUM('draft', 'sent', 'accepted', 'declined', 'expired'),
    allowNull: false,
    defaultValue: 'draft'
  },
  totalAmount: {
    type: DataTypes.DECIMAL(12, 2),
    allowNull: true,
    field: 'total_amount'
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
  followUpDate: {
    type: DataTypes.DATEONLY,
    allowNull: true,
    field: 'follow_up_date'
  },
  notes: {
    type: DataTypes.TEXT,
    allowNull: true
  }
}, {
  tableName: 'quotes',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});

// Associations
Quote.associate = (models) => {
  Quote.belongsTo(models.Tour, { foreignKey: 'tourId', as: 'tour' });
  Quote.belongsTo(models.Agent, { foreignKey: 'agentId', as: 'agent' });
  Quote.belongsTo(models.User, { foreignKey: 'consultantId', as: 'consultant' });
  Quote.hasMany(models.QuoteItem, { foreignKey: 'quoteId', as: 'items' });
};

module.exports = Quote;
