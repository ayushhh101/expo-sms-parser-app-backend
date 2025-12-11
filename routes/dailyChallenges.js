const express = require("express");
const router = express.Router();
const DailyChallenge = require("../models/Dailychallenge");
const SavingsJar = require("../models/SavingsJar");
const Transaction = require("../models/Transaction");
const moment = require("moment");

// GET ONLY TODAY'S TASKS (Timezone-safe)
router.get("/:userId", async (req, res) => {
  const { userId } = req.params;

  try {
    // Important: Using moment.utc() prevents timezone shifting problems
    const startOfToday = moment().startOf("day").toDate();
    const endOfToday = moment().endOf("day").toDate();

    const tasks = await DailyChallenge.find({
      userId,
      isExpired: false,
      dateAssigned: {
        $gte: startOfToday,
        $lte: endOfToday
      }
    })
      .sort({ priority: 1 });

    return res.json({
      success: true,
      dateSearched: {
        startOfToday,
        endOfToday,
      },
      challenges: tasks
    });

  } catch (err) {
    console.error("Error fetching today's challenges:", err);
    return res.json({ success: false, message: "Server error" });
  }
});

// COMPLETE CHALLENGE - Updates challenge status + creates savings transaction
router.post("/:challengeId/complete", async (req, res) => {
  const { challengeId } = req.params;
  const { userId, jarId, actualAmountPaise } = req.body;

  try {
    // 1. Find and validate challenge
    const challenge = await DailyChallenge.findOne({ challengeId, userId, status: 'active' });
    
    if (!challenge) {
      return res.status(404).json({ 
        success: false, 
        message: "Challenge not found or already completed" 
      });
    }

    // 2. Update challenge to completed
    challenge.status = 'completed';
    challenge.type = 'completed';
    challenge.completionData = {
      actualAmountPaise: actualAmountPaise || challenge.amountPaise,
      completedAt: new Date()
    };
    await challenge.save();

    // 3. Calculate savings amount (reward)
    const savingsAmount = challenge.rewardPaise / 100; // Convert paise to rupees

    // 4. Create a savings transaction (income type) to track challenge reward
    const savingsTx = await Transaction.create({
      txId: `tx_challenge_${challengeId}_${Date.now()}`,
      userId: userId,
      type: 'income',
      amountPaise: challenge.rewardPaise,
      category: 'challenge_reward',
      merchant: 'Daily Challenge',
      method: 'cash',
      timestamp: new Date(),
      source: 'manual',
      notes: `Challenge completed: ${challenge.title}`,
      synced: true
    });

    // 5. Always add reward to Challenge Rewards jar (auto-find or create)
    let jar = await SavingsJar.findOne({ 
      userId, 
      title: 'Challenge Rewards',
      status: 'active'
    });

    // Create Challenge Rewards jar if it doesn't exist
    if (!jar) {
      jar = await SavingsJar.create({
        userId: userId,
        title: 'Challenge Rewards',
        target: 999999999, // Infinite target
        saved: 0,
        deadline: new Date('2099-12-31'), // Far future
        status: 'active',
        icon: 'trophy',
        color: '#F59E0B',
        bg: 'bg-amber-900',
        transactions: []
      });
    }

    // Add reward to Challenge Rewards jar
    jar.saved += savingsAmount;
    jar.transactions.push({ 
      amount: savingsAmount,
      date: new Date()
    });

    await jar.save();

    // 6. Calculate updated totals for dashboard
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

    const jarStats = await SavingsJar.aggregate([
      { $match: { userId: userId } },
      { $group: { _id: null, totalSaved: { $sum: "$saved" } } }
    ]);
    const totalSavedInJars = jarStats[0]?.totalSaved || 0;

    // 7. Calculate monthly savings (includes jar transactions + challenge rewards)
    const startOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1);
    
    // Get jar transactions this month
    const monthlyJarStats = await SavingsJar.aggregate([
      { $match: { userId: userId } },
      { $unwind: "$transactions" },
      { $match: { "transactions.date": { $gte: startOfMonth } } },
      { 
        $group: { 
          _id: null, 
          totalSavedInJars: { $sum: "$transactions.amount" },
          jarTransactionCount: { $sum: 1 }
        } 
      }
    ]);

    // Get challenge rewards this month
    const monthlyChallengeStats = await Transaction.aggregate([
      { 
        $match: { 
          userId: userId,
          category: 'challenge_reward',
          timestamp: { $gte: startOfMonth }
        } 
      },
      { 
        $group: { 
          _id: null, 
          totalChallengeRewards: { $sum: "$amountPaise" },
          challengeCount: { $sum: 1 }
        } 
      }
    ]);

    const monthlySavingsFromJars = monthlyJarStats.length > 0 ? monthlyJarStats[0].totalSavedInJars : 0;
    const monthlyChallengeRewards = (monthlyChallengeStats.length > 0 ? monthlyChallengeStats[0].totalChallengeRewards : 0) / 100;
    const jarTransactionCount = monthlyJarStats.length > 0 ? monthlyJarStats[0].jarTransactionCount : 0;
    const challengeCount = monthlyChallengeStats.length > 0 ? monthlyChallengeStats[0].challengeCount : 0;
    
    const monthlySavings = monthlySavingsFromJars + monthlyChallengeRewards;
    const monthlyTransactions = jarTransactionCount + challengeCount;

    // 8. Return comprehensive response
    return res.json({
      success: true,
      message: jar 
        ? `Challenge completed! ₹${savingsAmount} saved to ${jar.title}` 
        : `Challenge completed! ₹${savingsAmount} earned`,
      challenge: {
        challengeId: challenge.challengeId,
        title: challenge.title,
        status: challenge.status,
        rewardPaise: challenge.rewardPaise,
        rewardAmount: savingsAmount,
        completedAt: challenge.completionData.completedAt
      },
      savingsTransaction: {
        txId: savingsTx.txId,
        amountPaise: savingsTx.amountPaise,
        amount: savingsAmount,
        timestamp: savingsTx.timestamp
      },
      jar: jar ? {
        id: jar._id,
        title: jar.title,
        saved: jar.saved,
        target: jar.target,
        progress: ((jar.saved / jar.target) * 100).toFixed(1),
        status: jar.status
      } : null,
      dashboard: {
        totalIncome: totalIncome,
        totalExpenses: totalExpenses,
        totalSavings: totalSavedInJars,
        unallocatedCash: totalIncome - totalExpenses - totalSavedInJars,
        monthlySavings: monthlySavings,
        monthlyTransactions: monthlyTransactions
      }
    });

  } catch (err) {
    console.error("Error completing challenge:", err);
    return res.status(500).json({ 
      success: false, 
      message: "Server error while completing challenge",
      error: err.message 
    });
  }
});

// GET CHALLENGE STATS (completed today, this week, this month)
router.get("/:userId/stats", async (req, res) => {
  const { userId } = req.params;

  try {
    const now = new Date();
    const startOfToday = moment().startOf("day").toDate();
    const startOfWeek = moment().startOf("week").toDate();
    const startOfMonth = moment().startOf("month").toDate();

    const [todayCompleted, weekCompleted, monthCompleted, totalRewards] = await Promise.all([
      DailyChallenge.countDocuments({
        userId,
        status: 'completed',
        'completionData.completedAt': { $gte: startOfToday }
      }),
      DailyChallenge.countDocuments({
        userId,
        status: 'completed',
        'completionData.completedAt': { $gte: startOfWeek }
      }),
      DailyChallenge.countDocuments({
        userId,
        status: 'completed',
        'completionData.completedAt': { $gte: startOfMonth }
      }),
      DailyChallenge.aggregate([
        { 
          $match: { 
            userId, 
            status: 'completed',
            'completionData.completedAt': { $gte: startOfMonth }
          } 
        },
        { 
          $group: { 
            _id: null, 
            totalRewardsPaise: { $sum: "$rewardPaise" } 
          } 
        }
      ])
    ]);

    return res.json({
      success: true,
      stats: {
        today: todayCompleted,
        thisWeek: weekCompleted,
        thisMonth: monthCompleted,
        monthlyRewardsEarned: (totalRewards[0]?.totalRewardsPaise || 0) / 100
      }
    });

  } catch (err) {
    console.error("Error fetching challenge stats:", err);
    return res.status(500).json({ 
      success: false, 
      message: "Server error" 
    });
  }
});

module.exports = router;
