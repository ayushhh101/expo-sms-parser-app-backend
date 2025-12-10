const mongoose = require('mongoose');
const moment = require('moment');
const connectDB = require('./config/db'); // Points to your db.js config
const Transaction = require('./models/Transaction');
const DailyCashflow = require('./models/DailyCashflow');

const syncData = async () => {
  try {
    // 1. Connect to DB
    await connectDB();
    console.log("🔌 Connected to DB...");

    // 2. Fetch ALL Transactions
    const transactions = await Transaction.find({});
    console.log(`📦 Found ${transactions.length} total transactions.`);

    if (transactions.length === 0) {
        console.log("⚠️ No transactions found. Nothing to sync.");
        process.exit();
    }

    // 3. Group by User ID first (Crucial for multi-user apps)
    const userMap = {};

    transactions.forEach(txn => {
        const uid = txn.userId;
        if (!userMap[uid]) {
            userMap[uid] = [];
        }
        userMap[uid].push(txn);
    });

    const userIds = Object.keys(userMap);
    console.log(`👤 Found ${userIds.length} users to process.`);

    // 4. Process Each User
    for (const userId of userIds) {
        console.log(`\nProcessing User: ${userId}...`);
        const userTxns = userMap[userId];

        // Group this user's transactions by Date (YYYY-MM-DD)
        const dailyMap = {};

        userTxns.forEach(txn => {
            const dateStr = moment(txn.timestamp).format('YYYY-MM-DD');
            if (!dailyMap[dateStr]) {
                dailyMap[dateStr] = { income: 0, expense: 0, date: dateStr };
            }
            
            if (txn.type === 'income') dailyMap[dateStr].income += txn.amountPaise;
            if (txn.type === 'expense') dailyMap[dateStr].expense += txn.amountPaise;
        });

        // 5. Save Summaries for this User
        const days = Object.keys(dailyMap);
        for (const dateStr of days) {
            const data = dailyMap[dateStr];
            
            // Re-construct the logic
            const net = data.income - data.expense;
            const netRupees = net / 100;

            let status = 'neutral';
            if (data.income > 0 || data.expense > 0) {
                if (netRupees >= 500) status = 'high_earning';
                else if (netRupees <= -200) status = 'heavy_expense';
                else status = 'balanced';
            }

            // The Date Object for midnight
            const dateObj = moment(dateStr, 'YYYY-MM-DD').toDate();

            await DailyCashflow.findOneAndUpdate(
                { userId: userId, date: dateObj },
                { 
                    income: data.income, 
                    expense: data.expense, 
                    net: net, 
                    status: status, 
                    lastUpdated: new Date() 
                },
                { upsert: true, new: true }
            );
            process.stdout.write('.'); // Progress dot
        }
    }

    console.log("\n\n✅ HISTORY SYNC COMPLETE!");
    process.exit();
    
  } catch (error) {
    console.error("\n❌ Error:", error);
    process.exit(1);
  }
};

syncData();