const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const SavingsJar = require('../models/SavingsJar');
const Transaction = require('../models/Transaction'); 

// --- 1. GET ALL JARS FOR USER ---
router.get('/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const jars = await SavingsJar.find({ userId, status: 'active' }).sort({ deadline: 1 });
    res.status(200).json({ success: true, data: jars });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// --- 2. CREATE NEW JAR (Unchanged) ---
router.post('/', async (req, res) => {
  try {
    const { userId, title, target, deadline, icon, color, bg } = req.body;
    const newJar = await SavingsJar.create({
      userId,
      title,
      target,
      deadline,
      icon: icon || "piggy-bank",
      color: color || "#10B981",
      bg: bg || "bg-slate-800"
    });
    res.status(201).json({ success: true, data: newJar });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

// --- 3. DEPOSIT MONEY (SECURE VERSION) ---
router.post('/:id/deposit', async (req, res) => {
  try {
    const { id } = req.params;
    const { amount, userId } = req.body; // 'amount' is in RUPEES
    
    if (!amount || amount <= 0) {
      return res.status(400).json({ success: false, message: "Invalid amount" });
    }

    // A. Find the Jar
    const jar = await SavingsJar.findOne({ _id: id, userId });
    if (!jar) {
      return res.status(404).json({ success: false, message: "Jar not found" });
    }

    // --- SAFETY CHECK START ---

    // Note: Transactions are in PAISE, so we divide by 100
    const txStats = await Transaction.aggregate([
      { $match: { userId: userId } },
      {
        $group: {
          _id: null,
          earnings: { $sum: { $cond: [{ $eq: ["$type", "income"] }, "$amountPaise", 0] } },
          spending: { $sum: { $cond: [{ $eq: ["$type", "expense"] }, "$amountPaise", 0] } }
        }
      }
    ]);

    const totalIncome = (txStats[0]?.earnings || 0) / 100; 
    const totalExpenses = (txStats[0]?.spending || 0) / 100;

    // C. Calculate Total Already Locked in Jars
    const jarStats = await SavingsJar.aggregate([
      { $match: { userId: userId } },
      { $group: { _id: null, totalSaved: { $sum: "$saved" } } }
    ]);
    const totalSavedInJars = jarStats[0]?.totalSaved || 0;

    const unallocatedCash = (totalIncome - totalExpenses) - totalSavedInJars;

    if (amount > unallocatedCash) {
       return res.status(400).json({ 
         success: false, 
         // Send the limit so the UI can show "You only have ₹500 left!"
         message: `Insufficient funds. You only have ₹${unallocatedCash} available.` 
       });
    }
    // --- SAFETY CHECK END ---
    jar.saved += Number(amount);
    jar.transactions.push({ amount: Number(amount) });
    
    if (jar.saved >= jar.target) {
      jar.status = 'completed'; // Optional: Auto-complete jar
    }

    await jar.save();

    res.status(200).json({ 
      success: true, 
      data: jar,
      newUnallocated: unallocatedCash - amount // Send this back for instant UI update
    });

  } catch (error) {
    console.error("Error depositing money:", error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// --- 4. GET MONTHLY SAVINGS STATS ---
// Endpoint: GET /api/jars/:userId/stats
router.get('/:userId/stats', async (req, res) => {
  try {
    const { userId } = req.params;
    const date = new Date();
    const startOfMonth = new Date(date.getFullYear(), date.getMonth(), 1);

    const stats = await SavingsJar.aggregate([
      { $match: { userId: userId } },
      { $unwind: "$transactions" },
      { $match: { "transactions.date": { $gte: startOfMonth } } },
      { $group: { 
          _id: null, 
          totalSavedThisMonth: { $sum: "$transactions.amount" },
          count: { $sum: 1 }
        } 
      }
    ]);

    const total = stats.length > 0 ? stats[0].totalSavedThisMonth : 0;
    const count = stats.length > 0 ? stats[0].count : 0;

    res.status(200).json({ 
      success: true, 
      data: {
        totalSavedThisMonth: total,
        challengesCompleted: count // We can use deposit count as a proxy for "challenges" or streaks
      }
    });

  } catch (error) {
    console.error("Error fetching jar stats:", error);
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;