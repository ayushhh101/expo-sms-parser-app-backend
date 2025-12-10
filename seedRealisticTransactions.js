const mongoose = require('mongoose');
const Transaction = require('./models/Transaction');

const MONGODB_URI = 'mongodb+srv://mumbaihacks:mumbaihacks@cluster0.fonvcex.mongodb.net/';

// Realistic merchant pools
const merchants = {
  food: {
    breakfast: ['Idli Corner', 'Udupi Cafe', 'South Indian Breakfast', 'Breakfast Point', 'Filter Coffee Shop', 'Tea Stall', 'Local Chai Point', 'Dosa Plaza', 'Upma Corner'],
    lunch: ['Annapurna Mess', 'Punjabi Dhaba', 'Meals Ready', 'Biryani House', 'Thali Restaurant', 'Paratha Junction', 'North Indian Dhaba', 'Lunch Home', 'Mess Counter'],
    dinner: ['Tandoor House', 'Chinese Corner', 'Mughlai Restaurant', 'Pizza Corner', 'Biryani Point', 'Family Restaurant', 'Night Canteen', 'Street Food'],
    snacks: ['Chai Stall', 'Tea Corner', 'Vada Pav Center', 'Samosa Point', 'Street Vendor', 'Paan Shop', 'Juice Corner', 'Bakery']
  },
  fuel: ['HP Petrol', 'Indian Oil', 'Bharat Petroleum', 'Shell Petrol', 'Reliance Petrol', 'Nayara Petrol'],
  recharge: ['Jio Recharge', 'Airtel Recharge', 'Vi Recharge', 'BSNL Recharge', 'Paytm Recharge'],
  transport: ['Uber', 'Ola', 'Rapido', 'Metro Card', 'Bus Pass', 'Auto Rickshaw'],
  entertainment: ['Netflix', 'Amazon Prime', 'Hotstar', 'Spotify', 'YouTube Premium', 'Movie Ticket'],
  medical: ['Apollo Pharmacy', 'MedPlus', 'Local Clinic', 'Generic Medicine', 'First Aid'],
  income: ['Swiggy', 'Zomato', 'Dunzo', 'Swiggy Genie']
};

// Helper to get random item from array
const random = (arr) => arr[Math.floor(Math.random() * arr.length)];

// Helper to generate random amount in range
const randomAmount = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;

// Generate realistic daily transactions
function generateDailyTransactions(date, userId) {
  const transactions = [];
  let txCounter = 1;
  const dayOfWeek = date.getDay(); // 0 = Sunday, 6 = Saturday
  const isWeekend = dayOfWeek === 0; // Sunday is off day
  const isWeekday = dayOfWeek >= 1 && dayOfWeek <= 6;
  
  // Format date components
  const dateStr = date.toISOString().split('T')[0];
  const baseId = `tx_${dateStr.replace(/-/g, '')}_`;
  
  // Morning routine (6-9 AM) - Breakfast and fuel
  if (isWeekday) {
    // Morning chai
    transactions.push({
      txId: `${baseId}${String(txCounter++).padStart(3, '0')}`,
      userId,
      type: 'expense',
      amountPaise: randomAmount(2000, 4000),
      category: 'food',
      merchant: random(merchants.food.breakfast),
      method: 'cash',
      timestamp: new Date(date.getFullYear(), date.getMonth(), date.getDate(), randomAmount(6, 7), randomAmount(0, 59)),
      source: 'manual',
      notes: 'Morning tea'
    });
    
    // Breakfast
    transactions.push({
      txId: `${baseId}${String(txCounter++).padStart(3, '0')}`,
      userId,
      type: 'expense',
      amountPaise: randomAmount(3000, 6000),
      category: 'food',
      merchant: random(merchants.food.breakfast),
      method: random(['cash', 'upi']),
      timestamp: new Date(date.getFullYear(), date.getMonth(), date.getDate(), randomAmount(7, 8), randomAmount(0, 59)),
      source: 'manual',
      notes: random(['Idli vada', 'Dosa', 'Upma', 'Poha breakfast', 'Paratha'])
    });
    
    // Morning fuel (every 2-3 days)
    if (Math.random() > 0.6) {
      transactions.push({
        txId: `${baseId}${String(txCounter++).padStart(3, '0')}`,
        userId,
        type: 'expense',
        amountPaise: randomAmount(10000, 20000),
        category: 'fuel',
        merchant: random(merchants.fuel),
        method: random(['cash', 'upi']),
        timestamp: new Date(date.getFullYear(), date.getMonth(), date.getDate(), randomAmount(8, 9), randomAmount(0, 59)),
        source: 'manual',
        notes: 'Morning fuel'
      });
    }
  }
  
  // Mid-day (10 AM - 2 PM) - Work hours, income from deliveries
  if (isWeekday) {
    // Morning shift income
    const morningDeliveries = randomAmount(10, 18);
    transactions.push({
      txId: `${baseId}${String(txCounter++).padStart(3, '0')}`,
      userId,
      type: 'income',
      amountPaise: morningDeliveries * randomAmount(2500, 3500),
      category: 'gig_payout',
      merchant: random(merchants.income),
      method: 'wallet',
      timestamp: new Date(date.getFullYear(), date.getMonth(), date.getDate(), randomAmount(11, 12), randomAmount(0, 59)),
      source: 'sms',
      notes: `${morningDeliveries} deliveries morning shift`
    });
    
    // Lunch
    transactions.push({
      txId: `${baseId}${String(txCounter++).padStart(3, '0')}`,
      userId,
      type: 'expense',
      amountPaise: randomAmount(7000, 13000),
      category: 'food',
      merchant: random(merchants.food.lunch),
      method: random(['cash', 'upi']),
      timestamp: new Date(date.getFullYear(), date.getMonth(), date.getDate(), randomAmount(13, 14), randomAmount(0, 59)),
      source: 'manual',
      notes: random(['Lunch thali', 'Meal combo', 'Rice and curry', 'Biryani', 'Special thali'])
    });
    
    // Afternoon chai
    if (Math.random() > 0.4) {
      transactions.push({
        txId: `${baseId}${String(txCounter++).padStart(3, '0')}`,
        userId,
        type: 'expense',
        amountPaise: randomAmount(2000, 3500),
        category: 'food',
        merchant: random(merchants.food.snacks),
        method: 'cash',
        timestamp: new Date(date.getFullYear(), date.getMonth(), date.getDate(), randomAmount(15, 16), randomAmount(0, 59)),
        source: 'manual',
        notes: random(['Tea break', 'Chai and samosa', 'Tea and biscuit'])
      });
    }
  }
  
  // Evening (5 PM - 9 PM) - Peak delivery hours
  if (isWeekday) {
    // Evening fuel (every 2-3 days)
    if (Math.random() > 0.65) {
      transactions.push({
        txId: `${baseId}${String(txCounter++).padStart(3, '0')}`,
        userId,
        type: 'expense',
        amountPaise: randomAmount(10000, 18000),
        category: 'fuel',
        merchant: random(merchants.fuel),
        method: random(['cash', 'upi']),
        timestamp: new Date(date.getFullYear(), date.getMonth(), date.getDate(), randomAmount(17, 18), randomAmount(0, 59)),
        source: 'manual',
        notes: 'Evening fuel top-up'
      });
    }
    
    // Evening shift income (higher earnings)
    const eveningDeliveries = randomAmount(15, 25);
    transactions.push({
      txId: `${baseId}${String(txCounter++).padStart(3, '0')}`,
      userId,
      type: 'income',
      amountPaise: eveningDeliveries * randomAmount(2800, 3800),
      category: 'gig_payout',
      merchant: random(merchants.income),
      method: 'wallet',
      timestamp: new Date(date.getFullYear(), date.getMonth(), date.getDate(), randomAmount(19, 20), randomAmount(0, 59)),
      source: 'sms',
      notes: `${eveningDeliveries} deliveries dinner rush`
    });
    
    // Dinner
    transactions.push({
      txId: `${baseId}${String(txCounter++).padStart(3, '0')}`,
      userId,
      type: 'expense',
      amountPaise: randomAmount(8000, 15000),
      category: 'food',
      merchant: random(merchants.food.dinner),
      method: random(['cash', 'upi']),
      timestamp: new Date(date.getFullYear(), date.getMonth(), date.getDate(), randomAmount(21, 22), randomAmount(0, 59)),
      source: 'manual',
      notes: random(['Dinner', 'Roti sabzi', 'Chicken curry', 'Fried rice', 'Biryani'])
    });
  }
  
  // Weekend (Sunday) - Lighter schedule
  if (isWeekend) {
    // Late breakfast
    transactions.push({
      txId: `${baseId}${String(txCounter++).padStart(3, '0')}`,
      userId,
      type: 'expense',
      amountPaise: randomAmount(5000, 10000),
      category: 'food',
      merchant: random(merchants.food.breakfast),
      method: random(['cash', 'upi']),
      timestamp: new Date(date.getFullYear(), date.getMonth(), date.getDate(), randomAmount(9, 11), randomAmount(0, 59)),
      source: 'manual',
      notes: random(['Late breakfast', 'Brunch special', 'Sunday breakfast'])
    });
    
    // Lunch
    transactions.push({
      txId: `${baseId}${String(txCounter++).padStart(3, '0')}`,
      userId,
      type: 'expense',
      amountPaise: randomAmount(10000, 18000),
      category: 'food',
      merchant: random(merchants.food.lunch),
      method: 'upi',
      timestamp: new Date(date.getFullYear(), date.getMonth(), date.getDate(), randomAmount(13, 15), randomAmount(0, 59)),
      source: 'manual',
      notes: random(['Sunday special', 'Family meal', 'Lunch treat'])
    });
    
    // Entertainment (sometimes)
    if (Math.random() > 0.7) {
      transactions.push({
        txId: `${baseId}${String(txCounter++).padStart(3, '0')}`,
        userId,
        type: 'expense',
        amountPaise: randomAmount(5000, 15000),
        category: 'entertainment',
        merchant: random(merchants.entertainment),
        method: 'upi',
        timestamp: new Date(date.getFullYear(), date.getMonth(), date.getDate(), randomAmount(16, 18), randomAmount(0, 59)),
        source: 'manual',
        notes: random(['Movie', 'Entertainment', 'Subscription', 'Fun activity'])
      });
    }
  }
  
  // Monthly events
  const dayOfMonth = date.getDate();
  
  // Phone recharge (around 5th of month)
  if (dayOfMonth === 5 || (dayOfMonth === 6 && isWeekend)) {
    transactions.push({
      txId: `${baseId}${String(txCounter++).padStart(3, '0')}`,
      userId,
      type: 'expense',
      amountPaise: randomAmount(29900, 49900),
      category: 'recharge',
      merchant: random(merchants.recharge),
      method: 'upi',
      timestamp: new Date(date.getFullYear(), date.getMonth(), date.getDate(), randomAmount(10, 16), randomAmount(0, 59)),
      source: 'manual',
      notes: 'Monthly phone recharge'
    });
  }
  
  // Send money home (around 1st of month)
  if (dayOfMonth === 1 || (dayOfMonth === 2 && date.getDay() === 1)) {
    transactions.push({
      txId: `${baseId}${String(txCounter++).padStart(3, '0')}`,
      userId,
      type: 'expense',
      amountPaise: randomAmount(150000, 200000),
      category: 'send_home',
      merchant: 'UPI Transfer',
      method: 'upi',
      timestamp: new Date(date.getFullYear(), date.getMonth(), date.getDate(), randomAmount(9, 12), randomAmount(0, 59)),
      source: 'manual',
      notes: 'Money sent to family'
    });
  }
  
  // Netflix/OTT subscription (around 10th)
  if (dayOfMonth === 10) {
    transactions.push({
      txId: `${baseId}${String(txCounter++).padStart(3, '0')}`,
      userId,
      type: 'expense',
      amountPaise: randomAmount(9900, 19900),
      category: 'entertainment',
      merchant: random(['Netflix', 'Amazon Prime', 'Hotstar']),
      method: 'upi',
      timestamp: new Date(date.getFullYear(), date.getMonth(), date.getDate(), randomAmount(8, 20), randomAmount(0, 59)),
      source: 'manual',
      notes: 'Monthly subscription'
    });
  }
  
  // Medical/pharmacy (random, once every 2 weeks)
  if (Math.random() > 0.92) {
    transactions.push({
      txId: `${baseId}${String(txCounter++).padStart(3, '0')}`,
      userId,
      type: 'expense',
      amountPaise: randomAmount(5000, 30000),
      category: 'medical',
      merchant: random(merchants.medical),
      method: random(['cash', 'upi']),
      timestamp: new Date(date.getFullYear(), date.getMonth(), date.getDate(), randomAmount(10, 19), randomAmount(0, 59)),
      source: 'manual',
      notes: random(['Medicine', 'First aid', 'Health checkup', 'Pharmacy'])
    });
  }
  
  // Transport (occasional Uber/Ola)
  if (Math.random() > 0.85 && isWeekday) {
    transactions.push({
      txId: `${baseId}${String(txCounter++).padStart(3, '0')}`,
      userId,
      type: 'expense',
      amountPaise: randomAmount(5000, 15000),
      category: 'transport',
      merchant: random(merchants.transport),
      method: 'upi',
      timestamp: new Date(date.getFullYear(), date.getMonth(), date.getDate(), randomAmount(7, 22), randomAmount(0, 59)),
      source: 'manual',
      notes: random(['Cab ride', 'Auto', 'Transport', 'Emergency ride'])
    });
  }
  
  // Random snacks/chai throughout working day
  if (isWeekday && Math.random() > 0.5) {
    transactions.push({
      txId: `${baseId}${String(txCounter++).padStart(3, '0')}`,
      userId,
      type: 'expense',
      amountPaise: randomAmount(2000, 5000),
      category: 'food',
      merchant: random(merchants.food.snacks),
      method: 'cash',
      timestamp: new Date(date.getFullYear(), date.getMonth(), date.getDate(), randomAmount(18, 20), randomAmount(0, 59)),
      source: 'manual',
      notes: random(['Evening snack', 'Chai break', 'Quick bite', 'Paan', 'Juice'])
    });
  }
  
  return transactions;
}

async function seedRealisticTransactions() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Clear existing transactions
    await Transaction.deleteMany({});
    console.log('🗑️  Cleared existing transactions');

    const userId = 'usr_rahul_001';
    const allTransactions = [];
    
    // Generate transactions from Oct 1, 2024 to Dec 11, 2024
    const startDate = new Date('2025-10-01');
    const endDate = new Date('2025-12-11');
    
    console.log('\n📅 Generating realistic transactions...');
    
    let currentDate = new Date(startDate);
    while (currentDate <= endDate) {
      const dailyTransactions = generateDailyTransactions(currentDate, userId);
      allTransactions.push(...dailyTransactions);
      
      // Move to next day
      currentDate = new Date(currentDate);
      currentDate.setDate(currentDate.getDate() + 1);
    }
    
    console.log(`📝 Generated ${allTransactions.length} transactions`);
    
    // Insert in batches to avoid memory issues
    const batchSize = 100;
    for (let i = 0; i < allTransactions.length; i += batchSize) {
      const batch = allTransactions.slice(i, i + batchSize);
      await Transaction.insertMany(batch);
      console.log(`   Inserted ${Math.min(i + batchSize, allTransactions.length)}/${allTransactions.length} transactions`);
    }
    
    // Calculate summary
    const totalIncome = allTransactions.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amountPaise, 0);
    const totalExpense = allTransactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amountPaise, 0);
    const incomeCount = allTransactions.filter(t => t.type === 'income').length;
    const expenseCount = allTransactions.filter(t => t.type === 'expense').length;
    
    console.log('\n💰 Summary (Oct 1 - Dec 11, 2025):');
    console.log(`   Total Transactions: ${allTransactions.length}`);
    console.log(`   Income Transactions: ${incomeCount} (₹${(totalIncome / 100).toFixed(2)})`);
    console.log(`   Expense Transactions: ${expenseCount} (₹${(totalExpense / 100).toFixed(2)})`);
    console.log(`   Net Savings: ₹${((totalIncome - totalExpense) / 100).toFixed(2)}`);
    console.log(`   Avg Daily Income: ₹${(totalIncome / 100 / 72).toFixed(2)}`);
    console.log(`   Avg Daily Expense: ₹${(totalExpense / 100 / 72).toFixed(2)}`);
    
    await mongoose.disconnect();
    console.log('\n✅ Transaction seeding completed!');
    process.exit(0);

  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

seedRealisticTransactions();
