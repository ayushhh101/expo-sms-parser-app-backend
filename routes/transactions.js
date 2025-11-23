const express = require('express');
const router = express.Router();
const Transaction = require('../models/Transaction');

// Get all transactions for a user
router.get('/user/:userId', async (req, res) => {
  try {
    const { limit = 50, page = 1, category } = req.query;
    const skip = (page - 1) * limit;

    const filter = { userId: req.params.userId };
    if (category) filter.category = category;

    const transactions = await Transaction.find(filter)
      .sort({ timestamp: -1 })
      .limit(parseInt(limit))
      .skip(skip);

    const total = await Transaction.countDocuments(filter);

    res.json({
      success: true,
      transactions,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Create new transaction
router.post('/', async (req, res) => {
  try {
    const transaction = await Transaction.create(req.body);
    res.status(201).json({
      success: true,
      transaction
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
});

// Get transaction by ID
router.get('/:txId', async (req, res) => {
  try {
    const transaction = await Transaction.findOne({ txId: req.params.txId });
    
    if (!transaction) {
      return res.status(404).json({
        success: false,
        error: 'Transaction not found'
      });
    }

    res.json({
      success: true,
      transaction
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

module.exports = router;