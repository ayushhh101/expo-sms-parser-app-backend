const express = require('express');
const router = express.Router();
const multer = require('multer'); // <--- ADDED
const path = require('path');     // <--- ADDED
const fs = require('fs');         // <--- ADDED
const Transaction = require('../models/Transaction');
const WeeklyBudget = require('../models/WeeklyBudget');
const DailyCashflow = require('../models/DailyCashflow');
const axios = require("axios");
const FormData = require("form-data");


// ==========================================
// 1. MULTER CONFIGURATION (For Voice Uploads)
// ==========================================
const uploadDir = 'uploads/';
// Create the uploads folder if it doesn't exist
if (!fs.existsSync(uploadDir)){
    fs.mkdirSync(uploadDir);
}

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir); 
  },
  filename: function (req, file, cb) {
    // Generates: voice_log_1732000000.m4a
    const uniqueSuffix = Date.now();
    cb(null, 'voice_log_' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ storage: storage });


router.post('/voice-log', upload.single('file'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ status: "error", message: "No file found" });
        }

        const { userId, language } = req.body;

        // 1) Create `meta` JSON exactly as FastAPI needs
        const meta = JSON.stringify({
            userId: userId,
            timestamp: String(Date.now())
        });

        // 2) Prepare form-data (file + meta + lang)
        const formData = new FormData();
        formData.append("meta", meta);
        formData.append("lang", language);
        formData.append("audio", fs.createReadStream(req.file.path), {
            filename: req.file.filename,
            contentType: req.file.mimetype
        });

        // 3) Call FastAPI endpoint
        const fastapiURL = "http://192.168.29.121:8000/api/speech_msg";

        const fastapiResponse = await axios.post(fastapiURL, formData, {
            headers: formData.getHeaders()
        });

        // 4) Return the processed result to frontend
        return res.json({
            status: "success",
            fastapi: fastapiResponse.data
        });

    } catch (error) {
        console.error("🔥 FastAPI error:", error?.response?.data || error.message);

        return res.status(500).json({
            status: "error",
            message: "Failed to process speech",
            details: error?.response?.data || error.message
        });
    }
});




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
    
    // Auto-update weekly budget if it's an expense transaction
    if (transaction.type === 'expense' && transaction.userId) {
      await updateWeeklyBudgetForTransaction(transaction);
    }

    // update cashflow
    if (transaction.userId) {
      await updateDailyCashflow(transaction); 
    }
    
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
    
    // Auto-update weekly budget if it's an expense transaction
    if (saved.type === 'expense' && saved.userId) {
      await updateWeeklyBudgetForTransaction(saved);
    }

    // update cashflow
    if (saved.userId) {
      await updateDailyCashflow(saved); 
    }
    
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


// Helper function to update weekly budget when transaction is added
async function updateWeeklyBudgetForTransaction(transaction) {
  try {
    const weekDates = WeeklyBudget.getWeekDates(transaction.timestamp);
    
    // Find or create weekly budget for the transaction's week
    let budget = await WeeklyBudget.findOne({
      userId: transaction.userId,
      weekStartDate: weekDates.weekStartDate
    });
    
    if (!budget) {
      // Create new budget if it doesn't exist
      budget = new WeeklyBudget({
        userId: transaction.userId,
        ...weekDates
      });
    }
    
    // Enhanced categorization with merchant and description
    const budgetCategory = WeeklyBudget.mapTransactionCategory(
      transaction.category, 
      transaction.merchant, 
      transaction.notes || transaction.description || ''
    );
    
    // Update the specific category with new transaction
    if (budget.categories[budgetCategory]) {
      budget.categories[budgetCategory].currentSpentPaise += transaction.amountPaise;
      budget.categories[budgetCategory].transactionCount += 1;
    }
    
    // Update transaction summary
    budget.transactionSummary.totalTransactions += 1;
    budget.transactionSummary.expenseTransactions += 1;
    
    // Recalculate average transaction amount
    const allTransactions = await Transaction.find({
      userId: transaction.userId,
      type: 'expense',
      timestamp: {
        $gte: weekDates.weekStartDate,
        $lte: weekDates.weekEndDate
      }
    });
    
    const totalSpent = allTransactions.reduce((sum, t) => sum + t.amountPaise, 0);
    budget.transactionSummary.avgTransactionPaise = allTransactions.length > 0 ? 
      Math.round(totalSpent / allTransactions.length) : 0;
    
    // Update largest expense if this transaction is larger
    if (transaction.amountPaise > budget.transactionSummary.largestExpensePaise) {
      budget.transactionSummary.largestExpensePaise = transaction.amountPaise;
    }
    
    // Update most active category
    const categoryCounts = {};
    allTransactions.forEach(t => {
      const category = WeeklyBudget.mapTransactionCategory(t.category, t.merchant, t.notes);
      categoryCounts[category] = (categoryCounts[category] || 0) + 1;
    });
    
    const mostActiveCategory = Object.entries(categoryCounts)
      .sort(([,a], [,b]) => b - a)[0]?.[0] || 'food';
    budget.transactionSummary.mostActiveCategory = mostActiveCategory;
    
    // Save budget (will trigger pre-save middleware for risk calculations)
    await budget.save();
    
    console.log(`📊 Updated weekly budget for user ${transaction.userId} - Category: ${budgetCategory}, Amount: ₹${transaction.amountPaise / 100}`);
    
  } catch (error) {
    console.error('Error updating weekly budget:', error);
    // Don't throw error to avoid breaking transaction creation
  }
}



async function updateDailyCashflow(transaction) {
  try {
    const moment = require('moment');
    
    //  identify the Day
    const dayStart = moment(transaction.timestamp).startOf('day').toDate();
    const dayEnd = moment(transaction.timestamp).endOf('day').toDate();

    // fetch transactions 
    const transactions = await Transaction.find({
      userId: transaction.userId,
      timestamp: { $gte: dayStart, $lte: dayEnd }
    });

    // calculate Totals
    let income = 0;
    let expense = 0;

    transactions.forEach(t => {
      if (t.type === 'income') income += t.amountPaise;
      if (t.type === 'expense') expense += t.amountPaise;
    });

    const net = income - expense;
    const netRupees = net / 100;

    //  status
    let status = 'neutral';
    if (income > 0 || expense > 0) {
       if (netRupees >= 500) status = 'high_earning';       // Green
       else if (netRupees <= -200) status = 'heavy_expense'; // Red
       else status = 'balanced';                            // Yellow
    }

    // update schema
    await DailyCashflow.findOneAndUpdate(
      { userId: transaction.userId, date: dayStart },
      { income, expense, net, status, lastUpdated: new Date() },
      { upsert: true, new: true }
    );
    console.log(`🔥 Updated Heatmap for ${moment(dayStart).format('YYYY-MM-DD')}`);

  } catch (error) {
    console.error('Heatmap Update Error:', error);
  }
}

module.exports = router;