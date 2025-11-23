const express = require('express');
const router = express.Router();
const SMS = require('../models/SMS');

// Get all SMS messages
router.get('/', async (req, res) => {
  try {
    const messages = await SMS.find().sort({ timestamp: -1 });
    res.json({
      success: true,
      count: messages.length,
      data: messages
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Get single SMS by ID
router.get('/:id', async (req, res) => {
  try {
    const message = await SMS.findById(req.params.id);
    if (!message) {
      return res.status(404).json({
        success: false,
        error: 'Message not found'
      });
    }
    res.json({
      success: true,
      data: message
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Create new SMS
router.post('/', async (req, res) => {
  try {
    const message = await SMS.create(req.body);
    res.status(201).json({
      success: true,
      data: message
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
});

// Update SMS
router.put('/:id', async (req, res) => {
  try {
    const message = await SMS.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    if (!message) {
      return res.status(404).json({
        success: false,
        error: 'Message not found'
      });
    }
    res.json({
      success: true,
      data: message
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
});

// Delete SMS
router.delete('/:id', async (req, res) => {
  try {
    const message = await SMS.findByIdAndDelete(req.params.id);
    if (!message) {
      return res.status(404).json({
        success: false,
        error: 'Message not found'
      });
    }
    res.json({
      success: true,
      data: {}
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

module.exports = router;
