const express = require('express');
const router = express.Router();
const { OvernightList, Tour } = require('../models');
const { Op } = require('sequelize');

// Get overnight lists for a tour
router.get('/tour/:tourId', async (req, res) => {
  try {
    const { tourId } = req.params;
    const { status } = req.query;

    const whereClause = { tourId };
    if (status) whereClause.status = status;

    const overnightLists = await OvernightList.findAll({
      where: whereClause,
      include: [{ model: Tour, as: 'tour' }],
      order: [['dayNumber', 'ASC']]
    });

    res.json(overnightLists);
  } catch (error) {
    console.error('Error fetching overnight lists:', error);
    res.status(500).json({ error: 'Failed to fetch overnight lists' });
  }
});

// Get single overnight list
router.get('/:id', async (req, res) => {
  try {
    const overnightList = await OvernightList.findByPk(req.params.id, {
      include: [{ model: Tour, as: 'tour' }]
    });

    if (!overnightList) {
      return res.status(404).json({ error: 'Overnight list not found' });
    }

    res.json(overnightList);
  } catch (error) {
    console.error('Error fetching overnight list:', error);
    res.status(500).json({ error: 'Failed to fetch overnight list' });
  }
});

// Create overnight list
router.post('/', async (req, res) => {
  try {
    const overnightList = await OvernightList.create(req.body);
    res.status(201).json(overnightList);
  } catch (error) {
    console.error('Error creating overnight list:', error);
    res.status(500).json({ error: 'Failed to create overnight list' });
  }
});

// Create multiple overnight lists for a tour
router.post('/tour/:tourId/bulk', async (req, res) => {
  try {
    const { tourId } = req.params;
    const { overnightLists } = req.body;

    // Validate that all items belong to the same tour
    const validatedLists = overnightLists.map(item => ({
      ...item,
      tourId: parseInt(tourId)
    }));

    const createdLists = await OvernightList.bulkCreate(validatedLists, {
      returning: true
    });

    res.status(201).json(createdLists);
  } catch (error) {
    console.error('Error creating bulk overnight lists:', error);
    res.status(500).json({ error: 'Failed to create overnight lists' });
  }
});

// Update overnight list
router.put('/:id', async (req, res) => {
  try {
    const overnightList = await OvernightList.findByPk(req.params.id);
    if (!overnightList) {
      return res.status(404).json({ error: 'Overnight list not found' });
    }

    const updatedList = await overnightList.update(req.body);
    res.json(updatedList);
  } catch (error) {
    console.error('Error updating overnight list:', error);
    res.status(500).json({ error: 'Failed to update overnight list' });
  }
});

// Update overnight list status
router.patch('/:id/status', async (req, res) => {
  try {
    const { status } = req.body;
    const overnightList = await OvernightList.findByPk(req.params.id);
    
    if (!overnightList) {
      return res.status(404).json({ error: 'Overnight list not found' });
    }

    await overnightList.update({ status });
    res.json(overnightList);
  } catch (error) {
    console.error('Error updating overnight list status:', error);
    res.status(500).json({ error: 'Failed to update overnight list status' });
  }
});

// Delete overnight list
router.delete('/:id', async (req, res) => {
  try {
    const overnightList = await OvernightList.findByPk(req.params.id);
    if (!overnightList) {
      return res.status(404).json({ error: 'Overnight list not found' });
    }

    await overnightList.destroy();
    res.json({ message: 'Overnight list deleted successfully' });
  } catch (error) {
    console.error('Error deleting overnight list:', error);
    res.status(500).json({ error: 'Failed to delete overnight list' });
  }
});

// Generate overnight list from tour itinerary
router.post('/generate/:tourId', async (req, res) => {
  try {
    const { tourId } = req.params;
    const { itinerary } = req.body;

    // Clear existing overnight lists for this tour
    await OvernightList.destroy({ where: { tourId } });

    // Generate new overnight lists from itinerary
    const overnightLists = itinerary.map((day, index) => ({
      tourId: parseInt(tourId),
      dayNumber: index + 1,
      date: day.date,
      location: day.location,
      accommodation: day.accommodation,
      accommodationType: day.accommodationType,
      paxCount: day.paxCount,
      roomConfiguration: day.roomConfiguration,
      mealsBreakfast: day.mealsBreakfast || 'x',
      mealsLunch: day.mealsLunch || 'x',
      mealsDinner: day.mealsDinner || 'x',
      activities: day.activities,
      supplier: day.supplier,
      status: 'provisional'
    }));

    const createdLists = await OvernightList.bulkCreate(overnightLists, {
      returning: true
    });

    res.status(201).json(createdLists);
  } catch (error) {
    console.error('Error generating overnight lists:', error);
    res.status(500).json({ error: 'Failed to generate overnight lists' });
  }
});

// Export overnight list as CSV
router.get('/tour/:tourId/export', async (req, res) => {
  try {
    const { tourId } = req.params;
    const { format = 'csv' } = req.query;

    const overnightLists = await OvernightList.findAll({
      where: { tourId },
      order: [['dayNumber', 'ASC']]
    });

    if (format === 'csv') {
      // Generate CSV content
      const csvHeader = 'Day,Date,Location,Accommodation,Type,Pax,Room Config,Breakfast,Lunch,Dinner,Activities,Supplier,Booking Ref,Status,Notes\n';
      const csvRows = overnightLists.map(item => 
        `${item.dayNumber},${item.date || ''},${item.location || ''},${item.accommodation || ''},${item.accommodationType || ''},${item.paxCount || ''},${item.roomConfiguration || ''},${item.mealsBreakfast || ''},${item.mealsLunch || ''},${item.mealsDinner || ''},${item.activities || ''},${item.supplier || ''},${item.bookingReference || ''},${item.status || ''},${item.notes || ''}`
      ).join('\n');

      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename="overnight-list-${tourId}.csv"`);
      res.send(csvHeader + csvRows);
    } else {
      res.json(overnightLists);
    }
  } catch (error) {
    console.error('Error exporting overnight lists:', error);
    res.status(500).json({ error: 'Failed to export overnight lists' });
  }
});

module.exports = router;
