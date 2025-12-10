const express = require("express");
const router = express.Router();
const DailyChallenge = require("../models/Dailychallenge");
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

module.exports = router;
