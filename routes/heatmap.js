const express = require('express');
const router = express.Router();
const moment = require('moment');
const DailyCashflow = require('../models/DailyCashflow');

// GET /api/heatmap?userId=101&month=11&year=2024
router.get('/', async (req, res) => {
  const { userId, month, year } = req.query;

  if (!userId || !month || !year) {
    return res.status(400).json({ error: "Missing required params" });
  }

  try {
    // 1. Define Range
    const startDate = moment(`${year}-${month.toString().padStart(2, '0')}-01`);
    const endDate = startDate.clone().endOf('month');

    // 2. Read from Cache (Fast!)
    // We fetch the pre-calculated rows directly from DB
    const summaries = await DailyCashflow.find({
      userId: userId,
      date: { $gte: startDate.toDate(), $lte: endDate.toDate() }
    });

    // 3. Create a Map for easy lookup
    const summaryMap = {};
    summaries.forEach(doc => {
        const dateStr = moment(doc.date).format('YYYY-MM-DD');
        summaryMap[dateStr] = doc;
    });

    // 4. Build the Full Calendar Response
    // We still loop through days to ensure we send empty objects for days with no data
    const daysInMonth = startDate.daysInMonth();
    const heatmapData = [];

    for (let i = 1; i <= daysInMonth; i++) {
        const dateStr = startDate.clone().date(i).format('YYYY-MM-DD');
        const doc = summaryMap[dateStr];

        if (doc) {
            // If data exists in DB, use it
            heatmapData.push({
                day: i,
                date: dateStr,
                income: Math.round(doc.income / 100),
                expense: Math.round(doc.expense / 100),
                net: Math.round(doc.net / 100),
                status: doc.status
            });
        } else {
            // If no data, send empty placeholder
            heatmapData.push({
                day: i,
                date: dateStr,
                income: 0,
                expense: 0,
                net: 0,
                status: 'neutral'
            });
        }
    }

    res.json({
      monthLabel: startDate.format('MMMM YYYY'),
      data: heatmapData
    });

  } catch (err) {
    console.error("Heatmap Read Error:", err);
    res.status(500).json({ error: "Server Error" });
  }
});

module.exports = router;