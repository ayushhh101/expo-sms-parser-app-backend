const express = require('express');
const router = express.Router();
const SavingsJar = require('../models/SavingsJar'); // Adjust path to your Model

// --- 1. GET ALL JARS FOR USER ---
// Endpoint: GET /api/jars/:userId
router.get('/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    
    // Fetch active jars sorted by deadline (so urgent ones show first)
    const jars = await SavingsJar.find({ userId, status: 'active' }).sort({ deadline: 1 });
    
    // The model's virtuals (suggested_amt) are automatically included here
    res.status(200).json({ success: true, data: jars });

  } catch (error) {
    console.error("Error fetching jars:", error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// --- 2. CREATE NEW JAR ---
// Endpoint: POST /api/jars
router.post('/', async (req, res) => {
  try {
    const { userId, title, target, deadline, icon, color, bg } = req.body;

    const newJar = await SavingsJar.create({
      userId,
      title,
      target,
      deadline, // Send as "YYYY-MM-DD" string from frontend
      icon: icon || "piggy-bank",
      color: color || "#10B981",
      bg: bg || "bg-slate-800"
    });

    res.status(201).json({ success: true, data: newJar });

  } catch (error) {
    console.error("Error creating jar:", error);
    res.status(400).json({ success: false, message: error.message });
  }
});

// --- 3. DEPOSIT MONEY ---
// Endpoint: POST /api/jars/:id/deposit
router.post('/:id/deposit', async (req, res) => {
  try {
    const { id } = req.params;
    const { amount } = req.body;

    // 1. Find the jar
    const jar = await SavingsJar.findById(id);
    if (!jar) {
      return res.status(404).json({ success: false, message: "Jar not found" });
    }

    // 2. Add money (converts string to number just in case)
    jar.saved += Number(amount);

    // 3. Track history
    jar.transactions.push({ amount: Number(amount) });

    // 4. Save updates
    await jar.save();

    // 5. Return updated jar (frontend will see new 'saved' & 'suggested_amt')
    res.status(200).json({ success: true, data: jar });

  } catch (error) {
    console.error("Error depositing money:", error);
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;