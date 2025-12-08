const connectDB = require('./config/db');
const Transaction = require('./models/Transaction');
const WeeklyBudget = require('./models/WeeklyBudget');
const User = require('./models/User');

// Will fetch actual user IDs from the database
let realUserIds = [];

const seedWeeklyBudgets = async () => {
  try {
    await connectDB();
    
    console.log('🌱 Starting Weekly Budget seeding...');
    
    // Fetch real users from database
    const users = await User.find({});
    if (users.length === 0) {
      console.log('❌ No users found in database. Please run seed.js first!');
      process.exit(1);
    }
    
    realUserIds = users.map(user => user.userId || user._id.toString());
    console.log(`👥 Found ${realUserIds.length} users:`, realUserIds);
    
    // Clear existing weekly budgets
    await WeeklyBudget.deleteMany({});
    console.log('🗑️  Cleared existing weekly budgets');
    
    const currentDate = new Date();
    const budgets = [];
    
    // Generate budgets for each real user for the last 4 weeks
    for (const userId of realUserIds) {
      console.log(`\n👤 Creating budgets for user: ${userId}`);
      
      // Get user's actual financial profile for realistic budgets
      const user = users.find(u => (u.userId || u._id.toString()) === userId);
      const userProfile = determineUserProfile(user);
      
      // Create budgets for last 4 weeks
      for (let weekOffset = 0; weekOffset < 4; weekOffset++) {
        const weekDate = new Date(currentDate);
        weekDate.setDate(weekDate.getDate() - (weekOffset * 7));
        
        const weekDates = WeeklyBudget.getWeekDates(weekDate);
        
        // Get real transactions for this week if they exist
        const weekTransactions = await Transaction.find({
          userId,
          type: 'expense',
          timestamp: {
            $gte: weekDates.weekStartDate,
            $lte: weekDates.weekEndDate
          }
        });
        
        // Create realistic weekly budget data
        const weeklyBudget = new WeeklyBudget({
          userId,
          ...weekDates,
          
          // Generate spending based on real user profile and transactions
          categories: generateCategorySpending(userId, weekOffset, userProfile, weekTransactions),
          
          transactionSummary: generateTransactionSummary(weekTransactions, userProfile),
          
          aiLastAnalyzed: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000) // Random time in last week
        });
        
        budgets.push(weeklyBudget);
        
        console.log(`  📅 Week ${weekOffset + 1}: ${weekDates.weekStartDate.toDateString()} - Total Budget: ₹${Math.floor(weeklyBudget.totalBudgetPaise / 100)}`);
      }
    }
    
    // Save all budgets
    await WeeklyBudget.insertMany(budgets);
    
    console.log('\n✅ Weekly Budget seeding completed!');
    console.log(`📊 Created ${budgets.length} weekly budget records`);
    
    
    // Display summary
    for (const userId of realUserIds) {
      const userBudgets = await WeeklyBudget.find({ userId }).sort({ weekStartDate: -1 });
      const currentWeek = userBudgets[0];
      
      console.log(`\n👤 User ${userId}:`);
      console.log(`  📈 Current Week Utilization: ${currentWeek.budgetUtilization}%`);
      console.log(`  ⚠️  Risk Score: ${currentWeek.overallRiskScore}/100`);
      console.log(`  💰 Spent: ₹${Math.floor(currentWeek.totalSpentPaise / 100)} / ₹${Math.floor(currentWeek.totalBudgetPaise / 100)}`);
      console.log(`  🔥 Most Active: ${currentWeek.transactionSummary.mostActiveCategory}`);
    }
    
    process.exit(0);
    
  } catch (error) {
    console.error('❌ Error seeding weekly budgets:', error);
    process.exit(1);
  }
};

// Determine user profile from real user data
function determineUserProfile(user) {
  if (!user || !user.financial_profile) {
    return 'student'; // default fallback
  }
  
  const monthlyIncome = user.financial_profile.monthly_income?.estimatedAmountPaise || 0;
  const workType = user.work_profile?.primary_work_type;
  
  // Convert paise to rupees for analysis
  const monthlyIncomeRupees = monthlyIncome / 100;
  
  // Determine profile based on income and work type
  if (workType === 'food_delivery' || workType === 'gig_work') {
    return monthlyIncomeRupees > 25000 ? 'gig_professional' : 'gig_worker';
  } else if (monthlyIncomeRupees > 50000) {
    return 'professional';
  } else if (monthlyIncomeRupees > 30000) {
    return 'working_class';
  } else {
    return 'student';
  }
}

// Generate transaction summary from real transactions or user profile
function generateTransactionSummary(weekTransactions, userProfile) {
  if (weekTransactions.length > 0) {
    // Use real transaction data
    const totalTransactions = weekTransactions.length;
    const expenseTransactions = weekTransactions.filter(t => t.type === 'expense').length;
    const incomeTransactions = totalTransactions - expenseTransactions;
    
    const totalSpent = weekTransactions.reduce((sum, t) => sum + (t.amountPaise || 0), 0);
    const avgTransaction = totalTransactions > 0 ? Math.round(totalSpent / totalTransactions) : 0;
    const largestExpense = Math.max(...weekTransactions.map(t => t.amountPaise || 0));
    
    // Find most common category
    const categoryCounts = {};
    weekTransactions.forEach(t => {
      const category = WeeklyBudget.mapTransactionCategory(t.category);
      categoryCounts[category] = (categoryCounts[category] || 0) + 1;
    });
    const mostActiveCategory = Object.entries(categoryCounts)
      .sort(([,a], [,b]) => b - a)[0]?.[0] || 'food';
    
    return {
      totalTransactions,
      incomeTransactions,
      expenseTransactions,
      avgTransactionPaise: avgTransaction,
      largestExpensePaise: largestExpense,
      mostActiveCategory
    };
  } else {
    // Generate based on user profile
    const baseTransactions = profileTransactionCounts[userProfile] || profileTransactionCounts.student;
    return {
      totalTransactions: Math.floor(Math.random() * 10) + baseTransactions.total,
      incomeTransactions: Math.floor(Math.random() * 3) + baseTransactions.income,
      expenseTransactions: Math.floor(Math.random() * 8) + baseTransactions.expense,
      avgTransactionPaise: Math.floor(Math.random() * 30000) + baseTransactions.avgAmount,
      largestExpensePaise: Math.floor(Math.random() * 300000) + baseTransactions.largestExpense,
      mostActiveCategory: baseTransactions.mostActive
    };
  }
}

const profileTransactionCounts = {
  gig_worker: {
    total: 25, income: 4, expense: 21,
    avgAmount: 25000, largestExpense: 200000, mostActive: 'fuel'
  },
  gig_professional: {
    total: 30, income: 5, expense: 25,
    avgAmount: 35000, largestExpense: 300000, mostActive: 'fuel'
  },
  working_class: {
    total: 20, income: 2, expense: 18,
    avgAmount: 40000, largestExpense: 250000, mostActive: 'food'
  },
  professional: {
    total: 18, income: 2, expense: 16,
    avgAmount: 80000, largestExpense: 500000, mostActive: 'entertainment'
  },
  student: {
    total: 15, income: 1, expense: 14,
    avgAmount: 20000, largestExpense: 150000, mostActive: 'food'
  }
};

// Generate category spending based on real user profile and transactions
function generateCategorySpending(userId, weekOffset, userProfile, weekTransactions = []) {
  const baseMultiplier = 1 - (weekOffset * 0.1); // Less spending in older weeks
  
  // If we have real transactions, analyze them
  if (weekTransactions.length > 0) {
    const categories = {};
    
    // Initialize all categories with base amounts
    const baseAmounts = spendingPatterns[userProfile] || spendingPatterns.student;
    Object.entries(baseAmounts).forEach(([categoryName, config]) => {
      categories[categoryName] = {
        maxBudgetPaise: config.base * 100,
        currentSpentPaise: 0,
        transactionCount: 0
      };
    });
    
    // Add real spending data
    weekTransactions.forEach(transaction => {
      const budgetCategory = WeeklyBudget.mapTransactionCategory(transaction.category);
      if (categories[budgetCategory]) {
        categories[budgetCategory].currentSpentPaise += transaction.amountPaise || 0;
        categories[budgetCategory].transactionCount += 1;
      }
    });
    
    return categories;
  }
  
  // Generate based on user profile
  const pattern = spendingPatterns[userProfile] || spendingPatterns.student;
  const categories = {};
  
  Object.entries(pattern).forEach(([categoryName, config]) => {
    const randomVariation = 1 + ((Math.random() - 0.5) * config.variance);
    const spending = Math.floor(config.base * baseMultiplier * randomVariation);
    const transactionCount = Math.floor(Math.random() * 6) + 2; // 2-8 transactions per category
    
    categories[categoryName] = {
      maxBudgetPaise: config.base * 100, // Keep original budget as max
      currentSpentPaise: spending * 100, // Convert to paise
      transactionCount
    };
  });
  
  return categories;
}

// Update spending patterns to include gig worker profiles
const spendingPatterns = {
  gig_worker: {
    food: { base: 1800, variance: 0.3 }, // Higher food costs for delivery workers
    fuel: { base: 1200, variance: 0.4 }, // High fuel costs
    transport: { base: 300, variance: 0.5 },
    recharge: { base: 299, variance: 0.2 },
    miscellaneous: { base: 800, variance: 0.6 },
    entertainment: { base: 200, variance: 0.8 },
    medical: { base: 200, variance: 1.0 },
    send_home: { base: 1000, variance: 0.3 }
  },
  gig_professional: {
    food: { base: 2500, variance: 0.3 },
    fuel: { base: 1800, variance: 0.4 }, // Even higher fuel costs
    transport: { base: 500, variance: 0.5 },
    recharge: { base: 399, variance: 0.2 },
    miscellaneous: { base: 1200, variance: 0.5 },
    entertainment: { base: 600, variance: 0.7 },
    medical: { base: 400, variance: 0.8 },
    send_home: { base: 2000, variance: 0.2 }
  },
  working_class: {
    food: { base: 2000, variance: 0.3 },
    fuel: { base: 800, variance: 0.4 },
    transport: { base: 400, variance: 0.5 },
    recharge: { base: 299, variance: 0.2 },
    miscellaneous: { base: 800, variance: 0.6 },
    entertainment: { base: 300, variance: 0.8 },
    medical: { base: 300, variance: 1.0 },
    send_home: { base: 1200, variance: 0.3 }
  },
  professional: {
    food: { base: 2200, variance: 0.4 },
    fuel: { base: 1200, variance: 0.3 },
    transport: { base: 800, variance: 0.5 },
    recharge: { base: 399, variance: 0.2 },
    miscellaneous: { base: 1200, variance: 0.5 },
    entertainment: { base: 800, variance: 0.7 },
    medical: { base: 500, variance: 0.8 },
    send_home: { base: 2000, variance: 0.2 }
  },
  student: {
    food: { base: 1200, variance: 0.3 },
    fuel: { base: 400, variance: 0.4 },
    transport: { base: 200, variance: 0.5 },
    recharge: { base: 199, variance: 0.2 },
    miscellaneous: { base: 300, variance: 0.6 },
    entertainment: { base: 150, variance: 0.8 },
    medical: { base: 100, variance: 1.0 },
    send_home: { base: 500, variance: 0.3 }
  }
};

// Get random active category for transaction summary
function getRandomActiveCategory() {
  const categories = ['food', 'fuel', 'transport', 'recharge', 'miscellaneous', 'entertainment'];
  return categories[Math.floor(Math.random() * categories.length)];
}

// Run the seeder
seedWeeklyBudgets();