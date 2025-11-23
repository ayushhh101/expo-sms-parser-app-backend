const express = require('express');
const router = express.Router();
const Goal = require('../models/Goal');

// Get all goals for a user
router.get('/user/:userId', async (req, res) => {
  try {
    const goals = await Goal.find({ userId: req.params.userId }).sort({ createdAt: -1 });
    
    res.json({
      success: true,
      goals
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Create new goal
router.post('/', async (req, res) => {
  try {
    const goal = await Goal.create(req.body);
    res.status(201).json({
      success: true,
      goal
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
});

// Update goal
router.put('/:goalId', async (req, res) => {
  try {
    const goal = await Goal.findOneAndUpdate(
      { goalId: req.params.goalId },
      { ...req.body, updatedAt: new Date() },
      { new: true, runValidators: true }
    );

    if (!goal) {
      return res.status(404).json({
        success: false,
        error: 'Goal not found'
      });
    }

    res.json({
      success: true,
      goal
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
});

module.exports = router;