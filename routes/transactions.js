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
// router.get('/:txId', async (req, res) => {
//   try {
//     const transaction = await Transaction.findOne({ txId: req.params.txId });
    
//     if (!transaction) {
//       return res.status(404).json({
//         success: false,
//         error: 'Transaction not found'
//       });
//     }

//     res.json({
//       success: true,
//       transaction
//     });
//   } catch (error) {
//     res.status(500).json({
//       success: false,
//       error: error.message
//     });
//   }
// });

router.post("/manual", async (req, res) => {
  try {
    const body = req.body;

    if (!body.txId || !body.userId || !body.amountPaise) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const saved = await Transaction.create(body);
    res.status(201).json({ ok: true, saved });
  } 
  catch(error) 
  {
    console.log(error);
    res.status(500).json({ message: "Server error" });
  }
});


router.get("/manual-logs", async (req, res) => {
  try {
    const { userId, filter } = req.query;

    if (!userId) {
      return res.status(400).json({ message: "userId required" });
    }

    let finalUserId = userId.trim();
    let dateFilter = {};

    if (filter === "week") {
      const last7Days = new Date();
      last7Days.setDate(last7Days.getDate() - 7);
      dateFilter = { timestamp: { $gte: last7Days } };
    }


    if (filter === "month") {
      const date = new Date();
      date.setMonth(date.getMonth() - 1);
      dateFilter = { timestamp: { $gte: date } };
    }

    const transactions = await Transaction.find({
      userId: finalUserId,
      source: "manual",
      ...dateFilter
    })
      .sort({ timestamp: -1 })
      .limit(50);

    res.json({ transactions });
  } catch (err) {
    console.error("Manual fetch error:", err);
    res.status(500).json({ message: "Server error" });
  }
});


module.exports = router;