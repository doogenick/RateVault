const express = require('express');
const router = express.Router();
const { BookingChecklist, Tour, User } = require('../models');
const { Op } = require('sequelize');

// Get checklists for a tour
router.get('/tour/:tourId', async (req, res) => {
  try {
    const { tourId } = req.params;
    const { type, completed, priority } = req.query;

    const whereClause = { tourId };
    if (type) whereClause.checklistType = type;
    if (completed !== undefined) whereClause.isCompleted = completed === 'true';
    if (priority) whereClause.priority = priority;

    const checklists = await BookingChecklist.findAll({
      where: whereClause,
      include: [
        { model: Tour, as: 'tour' },
        { model: User, as: 'completedByUser' }
      ],
      order: [['priority', 'DESC'], ['dueDate', 'ASC'], ['createdAt', 'ASC']]
    });

    res.json(checklists);
  } catch (error) {
    console.error('Error fetching checklists:', error);
    res.status(500).json({ error: 'Failed to fetch checklists' });
  }
});

// Get all checklists with filters
router.get('/', async (req, res) => {
  try {
    const { 
      type, 
      completed, 
      priority, 
      dueDateFrom, 
      dueDateTo, 
      page = 1, 
      limit = 50 
    } = req.query;

    const whereClause = {};
    if (type) whereClause.checklistType = type;
    if (completed !== undefined) whereClause.isCompleted = completed === 'true';
    if (priority) whereClause.priority = priority;
    if (dueDateFrom || dueDateTo) {
      whereClause.dueDate = {};
      if (dueDateFrom) whereClause.dueDate[Op.gte] = dueDateFrom;
      if (dueDateTo) whereClause.dueDate[Op.lte] = dueDateTo;
    }

    const checklists = await BookingChecklist.findAndCountAll({
      where: whereClause,
      include: [
        { model: Tour, as: 'tour' },
        { model: User, as: 'completedByUser' }
      ],
      limit: parseInt(limit),
      offset: (parseInt(page) - 1) * parseInt(limit),
      order: [['priority', 'DESC'], ['dueDate', 'ASC']]
    });

    res.json({
      checklists: checklists.rows,
      total: checklists.count,
      page: parseInt(page),
      pages: Math.ceil(checklists.count / parseInt(limit))
    });
  } catch (error) {
    console.error('Error fetching checklists:', error);
    res.status(500).json({ error: 'Failed to fetch checklists' });
  }
});

// Get single checklist
router.get('/:id', async (req, res) => {
  try {
    const checklist = await BookingChecklist.findByPk(req.params.id, {
      include: [
        { model: Tour, as: 'tour' },
        { model: User, as: 'completedByUser' }
      ]
    });

    if (!checklist) {
      return res.status(404).json({ error: 'Checklist not found' });
    }

    res.json(checklist);
  } catch (error) {
    console.error('Error fetching checklist:', error);
    res.status(500).json({ error: 'Failed to fetch checklist' });
  }
});

// Create checklist item
router.post('/', async (req, res) => {
  try {
    const checklist = await BookingChecklist.create(req.body);
    res.status(201).json(checklist);
  } catch (error) {
    console.error('Error creating checklist:', error);
    res.status(500).json({ error: 'Failed to create checklist' });
  }
});

// Create multiple checklist items for a tour
router.post('/tour/:tourId/bulk', async (req, res) => {
  try {
    const { tourId } = req.params;
    const { items } = req.body;

    // Validate that all items belong to the same tour
    const validatedItems = items.map(item => ({
      ...item,
      tourId: parseInt(tourId)
    }));

    const createdItems = await BookingChecklist.bulkCreate(validatedItems, {
      returning: true
    });

    res.status(201).json(createdItems);
  } catch (error) {
    console.error('Error creating bulk checklist items:', error);
    res.status(500).json({ error: 'Failed to create checklist items' });
  }
});

// Update checklist item
router.put('/:id', async (req, res) => {
  try {
    const checklist = await BookingChecklist.findByPk(req.params.id);
    if (!checklist) {
      return res.status(404).json({ error: 'Checklist not found' });
    }

    const updatedChecklist = await checklist.update(req.body);
    res.json(updatedChecklist);
  } catch (error) {
    console.error('Error updating checklist:', error);
    res.status(500).json({ error: 'Failed to update checklist' });
  }
});

// Mark checklist item as completed
router.patch('/:id/complete', async (req, res) => {
  try {
    const { completedBy } = req.body;
    const checklist = await BookingChecklist.findByPk(req.params.id);
    
    if (!checklist) {
      return res.status(404).json({ error: 'Checklist not found' });
    }

    await checklist.update({
      isCompleted: true,
      completedBy,
      completedAt: new Date()
    });

    res.json(checklist);
  } catch (error) {
    console.error('Error completing checklist:', error);
    res.status(500).json({ error: 'Failed to complete checklist' });
  }
});

// Mark checklist item as incomplete
router.patch('/:id/incomplete', async (req, res) => {
  try {
    const checklist = await BookingChecklist.findByPk(req.params.id);
    
    if (!checklist) {
      return res.status(404).json({ error: 'Checklist not found' });
    }

    await checklist.update({
      isCompleted: false,
      completedBy: null,
      completedAt: null
    });

    res.json(checklist);
  } catch (error) {
    console.error('Error marking checklist incomplete:', error);
    res.status(500).json({ error: 'Failed to mark checklist incomplete' });
  }
});

// Delete checklist item
router.delete('/:id', async (req, res) => {
  try {
    const checklist = await BookingChecklist.findByPk(req.params.id);
    if (!checklist) {
      return res.status(404).json({ error: 'Checklist not found' });
    }

    await checklist.destroy();
    res.json({ message: 'Checklist deleted successfully' });
  } catch (error) {
    console.error('Error deleting checklist:', error);
    res.status(500).json({ error: 'Failed to delete checklist' });
  }
});

// Generate standard checklist for a tour
router.post('/generate/:tourId', async (req, res) => {
  try {
    const { tourId } = req.params;
    const { tourType = 'standard' } = req.body;

    // Clear existing checklist items for this tour
    await BookingChecklist.destroy({ where: { tourId } });

    // Generate standard checklist based on tour type
    const standardChecklist = getStandardChecklist(tourType, tourId);
    
    const createdItems = await BookingChecklist.bulkCreate(standardChecklist, {
      returning: true
    });

    res.status(201).json(createdItems);
  } catch (error) {
    console.error('Error generating checklist:', error);
    res.status(500).json({ error: 'Failed to generate checklist' });
  }
});

// Get checklist statistics
router.get('/stats/overview', async (req, res) => {
  try {
    const stats = await BookingChecklist.findAll({
      attributes: [
        'checklistType',
        'priority',
        'isCompleted',
        [sequelize.fn('COUNT', sequelize.col('id')), 'count']
      ],
      group: ['checklistType', 'priority', 'isCompleted'],
      raw: true
    });

    res.json(stats);
  } catch (error) {
    console.error('Error fetching checklist stats:', error);
    res.status(500).json({ error: 'Failed to fetch checklist stats' });
  }
});

// Helper function to generate standard checklist
function getStandardChecklist(tourType, tourId) {
  const baseChecklist = [
    // Pre-tour items
    { tourId, checklistType: 'pre_tour', itemName: 'Create tour file and folder', priority: 'high', dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) },
    { tourId, checklistType: 'pre_tour', itemName: 'Send provisional booking requests to suppliers', priority: 'high', dueDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000) },
    { tourId, checklistType: 'pre_tour', itemName: 'Create overnight list', priority: 'high', dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000) },
    { tourId, checklistType: 'pre_tour', itemName: 'Send bookings update to agent', priority: 'medium', dueDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000) },
    { tourId, checklistType: 'pre_tour', itemName: 'Load tour onto Tour Plan', priority: 'high', dueDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000) },
    { tourId, checklistType: 'pre_tour', itemName: 'Create 25% deposit invoice', priority: 'high', dueDate: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000) },
    
    // Booking items
    { tourId, checklistType: 'booking', itemName: 'Confirm accommodation bookings', priority: 'high' },
    { tourId, checklistType: 'booking', itemName: 'Confirm activity bookings', priority: 'high' },
    { tourId, checklistType: 'booking', itemName: 'Confirm transport bookings', priority: 'high' },
    { tourId, checklistType: 'booking', itemName: 'Get booking references from suppliers', priority: 'medium' },
    { tourId, checklistType: 'booking', itemName: 'Update overnight list with references', priority: 'medium' },
    
    // Payment items
    { tourId, checklistType: 'payment', itemName: 'Send deposit invoice to agent', priority: 'high' },
    { tourId, checklistType: 'payment', itemName: 'Track deposit payment', priority: 'high' },
    { tourId, checklistType: 'payment', itemName: 'Send final payment invoice', priority: 'high' },
    { tourId, checklistType: 'payment', itemName: 'Track final payment', priority: 'high' },
    { tourId, checklistType: 'payment', itemName: 'Process supplier payments', priority: 'medium' },
    
    // Post-tour items
    { tourId, checklistType: 'post_tour', itemName: 'Collect tour feedback', priority: 'low' },
    { tourId, checklistType: 'post_tour', itemName: 'Update tour statistics', priority: 'low' },
    { tourId, checklistType: 'post_tour', itemName: 'Archive tour documents', priority: 'low' }
  ];

  return baseChecklist;
}

module.exports = router;
