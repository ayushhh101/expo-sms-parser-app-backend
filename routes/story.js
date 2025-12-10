const express = require("express");
const router = express.Router();
const MoneyStory = require("../models/MoneyStory");
const MonthlySummary = require("../models/MonthlySummary");

router.get("/:userId", async (req, res) => {
  const { userId } = req.params;

  try {
    // 1. Fetch the Story (to get the target month/year)
    const story = await MoneyStory.findOne({ userId }).sort({ timestamp: -1 });

    if (!story) {
      return res.json({ success: false, message: "Story not found" });
    }

    // Determine Current and Previous Month/Year
    // Assuming story.month is 1-12.
    const currMonth = story.month; 
    const currYear = new Date(story.timestamp).getFullYear();

    let prevMonth = currMonth - 1;
    let prevYear = currYear;
    if (prevMonth === 0) {
      prevMonth = 12;
      prevYear -= 1;
    }

    // 2. Fetch Summaries in Parallel
    const [currSummary, prevSummary] = await Promise.all([
      MonthlySummary.findOne({ userId, month: currMonth, year: currYear }),
      MonthlySummary.findOne({ userId, month: prevMonth, year: prevYear })
    ]);

    // 3. Helper to extract Income/Expense from the array
    const getStats = (doc) => {
      if (!doc || !doc.summary || !doc.summary.incomeExpense) {
        return { income: 0, expense: 0 };
      }
      const incObj = doc.summary.incomeExpense.find(x => x._id === "income");
      const expObj = doc.summary.incomeExpense.find(x => x._id === "expense");
      
      // Convert Paise to Rupees (Divide by 100)
      return {
        income: incObj ? Math.round(incObj.totalAmount / 100) : 0,
        expense: expObj ? Math.round(expObj.totalAmount / 100) : 0
      };
    };

    const curr = getStats(currSummary);
    const prev = getStats(prevSummary);

    // 4. Construct Visual Metrics
    const visualMetrics = {
      earnings: {
        current: curr.income,
        previous: prev.income,
        growth: curr.income - prev.income
      },
      spending: {
        current: curr.expense,
        previous: prev.expense
      },
      savings: {
        current: curr.income - curr.expense,
        previous: prev.income - prev.expense
      },
      topExpense: {
        category: "None",
        amount: 0,
        percentage: "0%"
      }
    };

    // 5. Map "Biggest Spike"
    if (currSummary?.summary?.biggestSpike) {
      const spike = currSummary.summary.biggestSpike;
      visualMetrics.topExpense = {
        category: spike.category,
        amount: Math.round(spike.amount), // Already in Rupees in your DB
        percentage: `${Math.round(spike.percent)}%`
      };
    }

    // 6. Return Combined Data
    return res.json({
      success: true,
      data: {
        ...story.toObject(),
        visual_metrics: visualMetrics
      }
    });

  } catch (err) {
    console.error("Error:", err);
    return res.json({ success: false, message: "Server error" });
  }
});

module.exports = router;