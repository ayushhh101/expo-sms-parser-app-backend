const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');

// IMPORT YOUR SPECIFIC MODELS
const User = require('../models/User');
const Transaction = require('../models/Transaction'); 
const SavingsJar = require('../models/SavingsJar'); 

// GET USER DASHBOARD (With Unit Conversion AND Today's Stats)
router.get('/:userId', async (req, res) => {
  try {
    const { userId } = req.params;

    // 1. Fetch User Profile
    const user = await User.findOne({ userId });
    if (!user) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }

    // 2. DEFINE "TODAY" (Start of the day: 00:00:00)
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);

    // 3. Calculate Transaction Stats (LIFETIME + TODAY)
    const transactionStats = await Transaction.aggregate([
      { $match: { userId: userId } }, 
      {
        $group: {
          _id: null,
          // --- LIFETIME TOTALS (For Unallocated Cash) ---
          totalEarningsPaise: { 
            $sum: { $cond: [{ $eq: ["$type", "income"] }, "$amountPaise", 0] } 
          },
          totalSpentPaise: { 
            $sum: { $cond: [{ $eq: ["$type", "expense"] }, "$amountPaise", 0] } 
          },
          // --- TODAY ONLY (For Green Card) ---
          todayEarningsPaise: {
            $sum: {
              $cond: [
                { $and: [
                  { $eq: ["$type", "income"] },
                  { $gte: ["$timestamp", startOfToday] } // Check if date is today
                ]}, 
                "$amountPaise", 
                0
              ]
            }
          },
          todaySpentPaise: {
            $sum: {
              $cond: [
                { $and: [
                  { $eq: ["$type", "expense"] },
                  { $gte: ["$timestamp", startOfToday] }
                ]}, 
                "$amountPaise", 
                0
              ]
            }
          }
        }
      }
    ]);

    const txStats = transactionStats[0] || { 
      totalEarningsPaise: 0, totalSpentPaise: 0,
      todayEarningsPaise: 0, todaySpentPaise: 0
    };

    // Convert to Rupees
    const totalEarnings = txStats.totalEarningsPaise / 100;
    const totalSpent = txStats.totalSpentPaise / 100;
    const todayEarned = txStats.todayEarningsPaise / 100;
    const todaySpent = txStats.todaySpentPaise / 100;

    // 4. Calculate Jar Savings (Total Locked)
    const jarStats = await SavingsJar.aggregate([
      { $match: { userId: userId } },
      {
        $group: {
          _id: null,
          totalSaved: { $sum: "$saved" }
        }
      }
    ]);

    const totalSaved = jarStats[0] ? jarStats[0].totalSaved : 0;

    // 5. Calculate "Today's Savings" (Optional: If Jars have transaction history)
    // If your Jar model has `transactions: [{ date: ..., amount: ... }]`
    const jarTodayStats = await SavingsJar.aggregate([
      { $match: { userId: userId } },
      { $unwind: "$transactions" }, // Flatten the array
      { $match: { "transactions.date": { $gte: startOfToday } } }, // Filter for today
      { $group: { _id: null, todaySaved: { $sum: "$transactions.amount" } } }
    ]);

    const todaySaved = jarTodayStats[0] ? jarTodayStats[0].todaySaved : 0;

    // 6. Calculate Unallocated Cash
    // Formula: (Lifetime Income - Lifetime Expense) - Total Locked in Jars
    const unallocatedCash = (totalEarnings - totalSpent) - totalSaved;

    // 7. Construct Response
    const userResponse = user.toObject();

    userResponse.stats = {
      // Lifetime (For Blue Box & Limits)
      totalEarnings,
      totalSpent,
      totalSaved,
      unallocatedCash,

      // Today (For Green Card)
      todayEarned,
      todaySpent,
      todaySaved
    };

    res.json({
      success: true,
      user: userResponse
    });

  } catch (error) {
    console.error("Dashboard Error:", error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Update User (Standard)
router.put('/:userId', async (req, res) => {
  try {
    const user = await User.findOneAndUpdate(
      { userId: req.params.userId },
      { ...req.body, updatedAt: new Date() },
      { new: true, runValidators: true }
    );
    if (!user) return res.status(404).json({ success: false, error: 'User not found' });
    res.json({ success: true, user });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
});

module.exports = router;