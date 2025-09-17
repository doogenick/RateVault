const express = require('express');
const router = express.Router();
const { Quote, QuoteItem, Tour, Agent } = require('../models');
const { Op } = require('sequelize');

// Get all quotes with filters
router.get('/', async (req, res) => {
  try {
    const { status, agentId, consultantId, dateFrom, dateTo, page = 1, limit = 20 } = req.query;
    
    const whereClause = {};
    if (status) whereClause.status = status;
    if (agentId) whereClause.agentId = agentId;
    if (consultantId) whereClause.consultantId = consultantId;
    if (dateFrom || dateTo) {
      whereClause.quoteDate = {};
      if (dateFrom) whereClause.quoteDate[Op.gte] = dateFrom;
      if (dateTo) whereClause.quoteDate[Op.lte] = dateTo;
    }

    const quotes = await Quote.findAndCountAll({
      where: whereClause,
      include: [
        { model: Tour, as: 'tour' },
        { model: Agent, as: 'agent' }
      ],
      limit: parseInt(limit),
      offset: (parseInt(page) - 1) * parseInt(limit),
      order: [['createdAt', 'DESC']]
    });

    res.json({
      quotes: quotes.rows,
      total: quotes.count,
      page: parseInt(page),
      pages: Math.ceil(quotes.count / parseInt(limit))
    });
  } catch (error) {
    console.error('Error fetching quotes:', error);
    res.status(500).json({ error: 'Failed to fetch quotes' });
  }
});

// Get single quote with items
router.get('/:id', async (req, res) => {
  try {
    const quote = await Quote.findByPk(req.params.id, {
      include: [
        { model: Tour, as: 'tour' },
        { model: Agent, as: 'agent' },
        { model: QuoteItem, as: 'items', order: [['dayNumber', 'ASC']] }
      ]
    });

    if (!quote) {
      return res.status(404).json({ error: 'Quote not found' });
    }

    res.json(quote);
  } catch (error) {
    console.error('Error fetching quote:', error);
    res.status(500).json({ error: 'Failed to fetch quote' });
  }
});

// Create new quote
router.post('/', async (req, res) => {
  try {
    const { tourId, agentId, consultantId, quoteDate, validUntil, currency, exchangeRate, items } = req.body;

    // Generate quote number
    const quoteNumber = await generateQuoteNumber();

    const quote = await Quote.create({
      quoteNumber,
      tourId,
      agentId,
      consultantId,
      quoteDate: quoteDate || new Date().toISOString().split('T')[0],
      validUntil,
      currency: currency || 'ZAR',
      exchangeRate,
      status: 'draft'
    });

    // Add quote items if provided
    if (items && items.length > 0) {
      const quoteItems = items.map(item => ({
        ...item,
        quoteId: quote.id
      }));
      await QuoteItem.bulkCreate(quoteItems);
    }

    // Calculate total amount
    const totalAmount = await calculateQuoteTotal(quote.id);
    await quote.update({ totalAmount });

    res.status(201).json(quote);
  } catch (error) {
    console.error('Error creating quote:', error);
    res.status(500).json({ error: 'Failed to create quote' });
  }
});

// Update quote
router.put('/:id', async (req, res) => {
  try {
    const quote = await Quote.findByPk(req.params.id);
    if (!quote) {
      return res.status(404).json({ error: 'Quote not found' });
    }

    const updatedQuote = await quote.update(req.body);

    // Recalculate total if items were updated
    if (req.body.items) {
      const totalAmount = await calculateQuoteTotal(quote.id);
      await updatedQuote.update({ totalAmount });
    }

    res.json(updatedQuote);
  } catch (error) {
    console.error('Error updating quote:', error);
    res.status(500).json({ error: 'Failed to update quote' });
  }
});

// Update quote status
router.patch('/:id/status', async (req, res) => {
  try {
    const { status } = req.body;
    const quote = await Quote.findByPk(req.params.id);
    
    if (!quote) {
      return res.status(404).json({ error: 'Quote not found' });
    }

    await quote.update({ status });
    res.json(quote);
  } catch (error) {
    console.error('Error updating quote status:', error);
    res.status(500).json({ error: 'Failed to update quote status' });
  }
});

// Add quote item
router.post('/:id/items', async (req, res) => {
  try {
    const quote = await Quote.findByPk(req.params.id);
    if (!quote) {
      return res.status(404).json({ error: 'Quote not found' });
    }

    const quoteItem = await QuoteItem.create({
      ...req.body,
      quoteId: quote.id
    });

    // Recalculate total
    const totalAmount = await calculateQuoteTotal(quote.id);
    await quote.update({ totalAmount });

    res.status(201).json(quoteItem);
  } catch (error) {
    console.error('Error adding quote item:', error);
    res.status(500).json({ error: 'Failed to add quote item' });
  }
});

// Update quote item
router.put('/:id/items/:itemId', async (req, res) => {
  try {
    const quoteItem = await QuoteItem.findOne({
      where: { id: req.params.itemId, quoteId: req.params.id }
    });

    if (!quoteItem) {
      return res.status(404).json({ error: 'Quote item not found' });
    }

    const updatedItem = await quoteItem.update(req.body);

    // Recalculate total
    const totalAmount = await calculateQuoteTotal(req.params.id);
    await Quote.findByPk(req.params.id).then(quote => quote.update({ totalAmount }));

    res.json(updatedItem);
  } catch (error) {
    console.error('Error updating quote item:', error);
    res.status(500).json({ error: 'Failed to update quote item' });
  }
});

// Delete quote item
router.delete('/:id/items/:itemId', async (req, res) => {
  try {
    const quoteItem = await QuoteItem.findOne({
      where: { id: req.params.itemId, quoteId: req.params.id }
    });

    if (!quoteItem) {
      return res.status(404).json({ error: 'Quote item not found' });
    }

    await quoteItem.destroy();

    // Recalculate total
    const totalAmount = await calculateQuoteTotal(req.params.id);
    await Quote.findByPk(req.params.id).then(quote => quote.update({ totalAmount }));

    res.json({ message: 'Quote item deleted successfully' });
  } catch (error) {
    console.error('Error deleting quote item:', error);
    res.status(500).json({ error: 'Failed to delete quote item' });
  }
});

// Helper functions
async function generateQuoteNumber() {
  const year = new Date().getFullYear();
  const lastQuote = await Quote.findOne({
    where: {
      quoteNumber: {
        [Op.like]: `${year}%`
      }
    },
    order: [['quoteNumber', 'DESC']]
  });

  if (!lastQuote) {
    return `${year}001`;
  }

  const lastNumber = parseInt(lastQuote.quoteNumber.substring(4));
  return `${year}${String(lastNumber + 1).padStart(3, '0')}`;
}

async function calculateQuoteTotal(quoteId) {
  const items = await QuoteItem.findAll({
    where: { quoteId }
  });

  return items.reduce((total, item) => {
    return total + (parseFloat(item.totalPrice) || 0);
  }, 0);
}

module.exports = router;
