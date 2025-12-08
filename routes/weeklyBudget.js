const express = require('express');
const router = express.Router();
const WeeklyBudget = require('../models/WeeklyBudget');
const Transaction = require('../models/Transaction');

// Get current week's budget for a user
router.get('/current/:userId', async (req, res) => {
  try {
    let budget = await WeeklyBudget.getCurrentWeekBudget(req.params.userId);
    
    if (!budget) {
      // Auto-generate budget for current week if it doesn't exist
      budget = await generateWeeklyBudgetFromTransactions(req.params.userId);
    }
    
    res.json({
      success: true,
      data: {
        budget,
        weekId: budget.weekId,
        categories: budget.categories,
        overallMetrics: {
          totalSpent: Math.floor(budget.totalSpentPaise / 100),
          totalBudget: Math.floor(budget.totalBudgetPaise / 100),
          utilizationPercent: budget.budgetUtilization,
          riskScore: budget.overallRiskScore
        }
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Generate/refresh weekly budget from user transactions
router.post('/generate/:userId', async (req, res) => {
  try {
    const { weekDate } = req.body; // optional specific week
    const budget = await generateWeeklyBudgetFromTransactions(req.params.userId, weekDate ? new Date(weekDate) : undefined);
    
    res.json({
      success: true,
      message: 'Weekly budget generated successfully',
      data: budget
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
});

// Update budget maximums (for AI Agent)
router.put('/update-limits/:userId', async (req, res) => {
  try {
    const { categoryLimits, weekDate } = req.body;
    
    let budget = await WeeklyBudget.getCurrentWeekBudget(req.params.userId);
    if (!budget && weekDate) {
      const weekDates = WeeklyBudget.getWeekDates(new Date(weekDate));
      budget = await WeeklyBudget.findOne({
        userId: req.params.userId,
        weekStartDate: weekDates.weekStartDate
      });
    }
    
    if (!budget) {
      return res.status(404).json({
        success: false,
        error: 'Weekly budget not found'
      });
    }
    
    // Update category limits
    Object.entries(categoryLimits).forEach(([category, limitRupees]) => {
      if (budget.categories[category]) {
        budget.categories[category].maxBudgetPaise = limitRupees * 100;
      }
    });
    
    budget.aiLastAnalyzed = new Date();
    await budget.save();
    
    res.json({
      success: true,
      message: 'Budget limits updated successfully',
      data: budget
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
});

// Get budget history for user
router.get('/history/:userId', async (req, res) => {
  try {
    const { limit = 8 } = req.query; // last 8 weeks
    
    const budgets = await WeeklyBudget.find({
      userId: req.params.userId
    })
    .sort({ weekStartDate: -1 })
    .limit(parseInt(limit));
    
    const trends = calculateBudgetTrends(budgets);
    
    res.json({
      success: true,
      data: {
        budgets,
        trends,
        totalWeeks: budgets.length
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Get specific week's budget
router.get('/week/:userId/:year/:weekNumber', async (req, res) => {
  try {
    const { year, weekNumber } = req.params;
    
    const budget = await WeeklyBudget.findOne({
      userId: req.params.userId,
      year: parseInt(year),
      weekNumber: parseInt(weekNumber)
    });
    
    if (!budget) {
      return res.status(404).json({
        success: false,
        error: 'Budget for specified week not found'
      });
    }
    
    res.json({
      success: true,
      data: budget
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Force refresh current week budget from latest transactions
router.post('/refresh/:userId', async (req, res) => {
  try {
    const budget = await refreshWeeklyBudgetFromTransactions(req.params.userId);
    
    res.json({
      success: true,
      message: 'Weekly budget refreshed successfully',
      data: {
        budget,
        overallMetrics: {
          totalSpent: Math.floor(budget.totalSpentPaise / 100),
          totalBudget: Math.floor(budget.totalBudgetPaise / 100),
          utilizationPercent: budget.budgetUtilization,
          riskScore: budget.overallRiskScore
        }
      }
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
});

// Helper function to generate weekly budget from transactions
async function generateWeeklyBudgetFromTransactions(userId, weekDate = new Date()) {
  const weekDates = WeeklyBudget.getWeekDates(weekDate);
  
  // Get all expense transactions for the week
  const transactions = await Transaction.find({
    userId,
    type: 'expense',
    timestamp: {
      $gte: weekDates.weekStartDate,
      $lte: weekDates.weekEndDate
    }
  }).sort({ timestamp: -1 });
  
  // Check if budget already exists
  let budget = await WeeklyBudget.findOne({
    userId,
    weekStartDate: weekDates.weekStartDate
  });
  
  if (!budget) {
    // Create new budget
    budget = new WeeklyBudget({
      userId,
      ...weekDates
    });
  }
  
  // Reset current spending and counts
  Object.keys(budget.categories).forEach(categoryName => {
    budget.categories[categoryName].currentSpentPaise = 0;
    budget.categories[categoryName].transactionCount = 0;
  });
  
  // Analyze transactions and categorize spending
  let totalTransactions = transactions.length;
  let largestExpense = 0;
  let categoryTransactionCounts = {};
  
  transactions.forEach(transaction => {
    const budgetCategory = WeeklyBudget.mapTransactionCategory(
      transaction.category, 
      transaction.merchant, 
      transaction.notes || transaction.description || ''
    );
    const amount = transaction.amountPaise;
    
    // Add to category spending
    if (budget.categories[budgetCategory]) {
      budget.categories[budgetCategory].currentSpentPaise += amount;
      budget.categories[budgetCategory].transactionCount += 1;
    }
    
    // Track largest expense
    if (amount > largestExpense) {
      largestExpense = amount;
    }
    
    // Count transactions per category
    categoryTransactionCounts[budgetCategory] = (categoryTransactionCounts[budgetCategory] || 0) + 1;
  });
  
  // Find most active category
  const mostActiveCategory = Object.entries(categoryTransactionCounts)
    .sort(([,a], [,b]) => b - a)[0]?.[0] || 'food';
  
  // Calculate average transaction amount
  const totalSpent = Object.values(budget.categories)
    .reduce((sum, cat) => sum + cat.currentSpentPaise, 0);
  const avgTransaction = totalTransactions > 0 ? Math.round(totalSpent / totalTransactions) : 0;
  
  // Update transaction summary
  budget.transactionSummary = {
    totalTransactions,
    incomeTransactions: 0, // We only looked at expenses
    expenseTransactions: totalTransactions,
    avgTransactionPaise: avgTransaction,
    largestExpensePaise: largestExpense,
    mostActiveCategory
  };
  
  // Save budget (will trigger pre-save middleware for calculations)
  await budget.save();
  
  return budget;
}

// Helper function to refresh current week budget (used by transaction auto-updates)
async function refreshWeeklyBudgetFromTransactions(userId, weekDate = new Date()) {
  return await generateWeeklyBudgetFromTransactions(userId, weekDate);
}

// Helper function to calculate trends
function calculateBudgetTrends(budgets) {
  if (budgets.length < 2) return { trend: 'stable', change: 0 };
  
  const latest = budgets[0].totalSpentPaise;
  const previous = budgets[1].totalSpentPaise;
  const changePercent = previous > 0 ? ((latest - previous) / previous) * 100 : 0;
  
  let trend = 'stable';
  if (changePercent > 10) trend = 'increasing';
  else if (changePercent < -10) trend = 'decreasing';
  
  return {
    trend,
    change: Math.round(changePercent),
    weeklyAverage: Math.round(budgets.reduce((sum, b) => sum + b.totalSpentPaise, 0) / budgets.length / 100)
  };
}

// Export the refresh function for use in transaction routes
module.exports = router;
module.exports.refreshWeeklyBudgetFromTransactions = refreshWeeklyBudgetFromTransactions;