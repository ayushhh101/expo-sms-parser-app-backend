const express = require('express');
const router = express.Router();
const LifeEvent = require('../models/LifeEvent');

// Get all life events for a user
router.get('/user/:userId', async (req, res) => {
  try {
    const events = await LifeEvent.find({ userId: req.params.userId }).sort({ eventDate: 1 });
    
    res.json({
      success: true,
      events
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Create new life event
router.post('/', async (req, res) => {
  try {
    const event = await LifeEvent.create(req.body);
    res.status(201).json({
      success: true,
      event
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
});

module.exports = router;