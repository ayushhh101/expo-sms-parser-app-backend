const mongoose = require('mongoose');
const WeeklyBudget = require('./models/WeeklyBudget');
const Transaction = require('./models/Transaction');

const MONGODB_URI = 'mongodb+srv://mumbaihacks:mumbaihacks@cluster0.fonvcex.mongodb.net/';

async function seedRealisticWeeklyBudgets() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Clear existing weekly budgets
    await WeeklyBudget.deleteMany({});
    console.log('🗑️  Cleared existing weekly budgets');

    const userId = 'usr_rahul_001';
    const budgets = [];

    // Generate weekly budgets from Oct 1, 2025 to Dec 11, 2025 (11 weeks)
    const startDate = new Date('2025-10-01');
    const endDate = new Date('2025-12-11');
    
    let currentDate = new Date(startDate);
    let weekCount = 0;

    console.log('🌱 Generating realistic weekly budgets...\n');

    while (currentDate <= endDate) {
      weekCount++;
      const weekDates = WeeklyBudget.getWeekDates(currentDate);
      
      // Get actual transactions for this week
      const weekTransactions = await Transaction.find({
        userId,
        type: 'expense',
        timestamp: {
          $gte: weekDates.weekStartDate,
          $lte: weekDates.weekEndDate
        }
      });

      // Initialize categories with realistic budgets for a gig worker
      const categories = {
        food: {
          currentSpentPaise: 0,
          maxBudgetPaise: getWeeklyBudget('food', weekCount), // Varies by week
          transactionCount: 0
        },
        fuel: {
          currentSpentPaise: 0,
          maxBudgetPaise: getWeeklyBudget('fuel', weekCount),
          transactionCount: 0
        },
        transport: {
          currentSpentPaise: 0,
          maxBudgetPaise: getWeeklyBudget('transport', weekCount),
          transactionCount: 0
        },
        recharge: {
          currentSpentPaise: 0,
          maxBudgetPaise: getWeeklyBudget('recharge', weekCount),
          transactionCount: 0
        },
        miscellaneous: {
          currentSpentPaise: 0,
          maxBudgetPaise: getWeeklyBudget('miscellaneous', weekCount),
          transactionCount: 0
        },
        entertainment: {
          currentSpentPaise: 0,
          maxBudgetPaise: getWeeklyBudget('entertainment', weekCount),
          transactionCount: 0
        },
        medical: {
          currentSpentPaise: 0,
          maxBudgetPaise: getWeeklyBudget('medical', weekCount),
          transactionCount: 0
        },
        send_home: {
          currentSpentPaise: 0,
          maxBudgetPaise: getWeeklyBudget('send_home', weekCount),
          transactionCount: 0
        }
      };

      // Process actual transactions
      let largestExpense = 0;
      const categoryCounts = {};

      weekTransactions.forEach(transaction => {
        const budgetCategory = WeeklyBudget.mapTransactionCategory(
          transaction.category,
          transaction.merchant,
          transaction.notes
        );

        if (categories[budgetCategory]) {
          categories[budgetCategory].currentSpentPaise += transaction.amountPaise;
          categories[budgetCategory].transactionCount += 1;
        }

        if (transaction.amountPaise > largestExpense) {
          largestExpense = transaction.amountPaise;
        }

        categoryCounts[budgetCategory] = (categoryCounts[budgetCategory] || 0) + 1;
      });

      // Calculate transaction summary
      const totalSpent = Object.values(categories).reduce((sum, cat) => sum + cat.currentSpentPaise, 0);
      const avgTransaction = weekTransactions.length > 0 ? Math.round(totalSpent / weekTransactions.length) : 0;
      const mostActiveCategory = Object.entries(categoryCounts)
        .sort(([,a], [,b]) => b - a)[0]?.[0] || 'food';

      // Get income transactions for this week
      const incomeTransactions = await Transaction.find({
        userId,
        type: 'income',
        timestamp: {
          $gte: weekDates.weekStartDate,
          $lte: weekDates.weekEndDate
        }
      });

      // Create weekly budget
      const weeklyBudget = new WeeklyBudget({
        userId,
        ...weekDates,
        categories,
        transactionSummary: {
          totalTransactions: weekTransactions.length + incomeTransactions.length,
          incomeTransactions: incomeTransactions.length,
          expenseTransactions: weekTransactions.length,
          avgTransactionPaise: avgTransaction,
          largestExpensePaise: largestExpense,
          mostActiveCategory
        },
        adjustmentFlags: getAdjustmentFlags(weekCount, weekDates),
        aiLastAnalyzed: new Date(weekDates.weekEndDate.getTime() - Math.random() * 2 * 24 * 60 * 60 * 1000)
      });

      budgets.push(weeklyBudget);

      const totalBudget = Object.values(categories).reduce((sum, cat) => sum + cat.maxBudgetPaise, 0);
      const totalSpentDisplay = Object.values(categories).reduce((sum, cat) => sum + cat.currentSpentPaise, 0);
      
      console.log(`Week ${weekCount}: ${weekDates.weekStartDate.toISOString().split('T')[0]} to ${weekDates.weekEndDate.toISOString().split('T')[0]}`);
      console.log(`  Budget: ₹${(totalBudget / 100).toFixed(0)} | Spent: ₹${(totalSpentDisplay / 100).toFixed(0)} | Transactions: ${weekTransactions.length + incomeTransactions.length}`);

      // Move to next week (add 7 days)
      currentDate.setDate(currentDate.getDate() + 7);
    }

    // Save all budgets
    await WeeklyBudget.insertMany(budgets);

    console.log(`\n✅ Created ${budgets.length} weekly budgets`);
    
    // Summary statistics
    const totalBudgetSum = budgets.reduce((sum, b) => sum + b.totalBudgetPaise, 0);
    const totalSpentSum = budgets.reduce((sum, b) => sum + b.totalSpentPaise, 0);
    const avgUtilization = budgets.reduce((sum, b) => sum + b.budgetUtilization, 0) / budgets.length;
    const avgRisk = budgets.reduce((sum, b) => sum + b.overallRiskScore, 0) / budgets.length;

    console.log('\n📊 Summary Statistics:');
    console.log(`   Total Budget (11 weeks): ₹${(totalBudgetSum / 100).toFixed(2)}`);
    console.log(`   Total Spent (11 weeks): ₹${(totalSpentSum / 100).toFixed(2)}`);
    console.log(`   Average Utilization: ${avgUtilization.toFixed(1)}%`);
    console.log(`   Average Risk Score: ${avgRisk.toFixed(1)}/100`);

    await mongoose.disconnect();
    console.log('\n✅ Weekly budget seeding completed!');
    process.exit(0);

  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

// Get realistic weekly budget based on week number and category
function getWeeklyBudget(category, weekNumber) {
  // Base budgets for a food delivery worker (weekly amounts in rupees)
  const baseBudgets = {
    food: 2400,         // ₹2400/week for food
    fuel: 1600,         // ₹1600/week for fuel (high usage)
    transport: 400,     // ₹400/week for public transport
    recharge: 100,      // ₹100/week (₹400/month split)
    miscellaneous: 1000, // ₹1000/week for misc
    entertainment: 500,  // ₹500/week for entertainment
    medical: 300,        // ₹300/week for medical
    send_home: 1500      // ₹1500/week to send home
  };

  let budget = baseBudgets[category];

  // Seasonal variations
  const weekOfYear = weekNumber % 52;
  
  // October - Diwali preparations (weeks 40-43)
  if (weekOfYear >= 40 && weekOfYear <= 43) {
    if (category === 'food') budget *= 1.2; // More festive food
    if (category === 'entertainment') budget *= 1.5; // More celebrations
    if (category === 'send_home') budget *= 1.3; // Send more home for Diwali
  }

  // November - Post-Diwali recovery (weeks 44-47)
  if (weekOfYear >= 44 && weekOfYear <= 47) {
    if (category === 'food') budget *= 0.9; // Cut back a bit
    if (category === 'entertainment') budget *= 0.7; // Less entertainment
  }

  // December - Year-end, planning for new year (weeks 48-52)
  if (weekOfYear >= 48 && weekOfYear <= 52) {
    if (category === 'miscellaneous') budget *= 1.1; // Year-end shopping
    if (category === 'send_home') budget *= 1.2; // Send more for year-end
  }

  // Every 4th week - phone recharge week
  if (weekNumber % 4 === 0) {
    if (category === 'recharge') budget = 400; // Full recharge
  }

  // Random variation to make it realistic (±10%)
  const variation = 0.9 + (Math.random() * 0.2);
  budget *= variation;

  // Convert to paise
  return Math.round(budget * 100);
}

// Get realistic adjustment flags based on week number
function getAdjustmentFlags(weekNumber, weekDates) {
  const flags = {
    incomeDropDetected: false,
    incomeSpike: false,
    festivalMonth: false,
    emergencySpend: false,
    cashFluctuation: false,
    emiDueDate: false
  };

  const weekOfYear = weekNumber % 52;
  const month = weekDates.weekStartDate.getMonth(); // 0-11

  // October/November - Festival season
  if (month === 9 || month === 10) { // Oct or Nov
    flags.festivalMonth = true;
  }

  // Simulate occasional income fluctuations (gig work nature)
  if (Math.random() < 0.2) { // 20% chance
    flags.cashFluctuation = true;
  }

  // Rainy season (monsoon) - income drop for delivery workers
  if (month === 6 || month === 7 || month === 8) { // July-Sept
    if (Math.random() < 0.3) { // 30% chance
      flags.incomeDropDetected = true;
    }
  }

  // Peak seasons (festivals, holidays) - income spike
  if (weekOfYear >= 40 && weekOfYear <= 43) { // Diwali weeks
    if (Math.random() < 0.4) { // 40% chance
      flags.incomeSpike = true;
    }
  }

  // Occasional emergency expenses
  if (Math.random() < 0.1) { // 10% chance
    flags.emergencySpend = true;
  }

  return flags;
}

// Run the seeder
seedRealisticWeeklyBudgets();
