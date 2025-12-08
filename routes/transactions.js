const express = require('express');
const router = express.Router();
const multer = require('multer'); // <--- ADDED
const path = require('path');     // <--- ADDED
const fs = require('fs');         // <--- ADDED
const Transaction = require('../models/Transaction');


// ==========================================
// 1. MULTER CONFIGURATION (For Voice Uploads)
// ==========================================
const uploadDir = 'uploads/';
// Create the uploads folder if it doesn't exist
if (!fs.existsSync(uploadDir)){
    fs.mkdirSync(uploadDir);
}

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir); 
  },
  filename: function (req, file, cb) {
    // Generates: voice_log_1732000000.m4a
    const uniqueSuffix = Date.now();
    cb(null, 'voice_log_' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ storage: storage });

// ==========================================
// 2. VOICE LOG ROUTE (New)
// ==========================================
router.post('/voice-log', upload.single('file'), (req, res) => {
    console.log("------------------------------------------------");
    console.log("📞 HIT RECEIVED: Voice Log Endpoint");
    
    if (req.file) {
        console.log("✅ FILE ARRIVED!");
        console.log("   - Saved At:", req.file.path);
        console.log("   - Size:", req.file.size);
        console.log("👤 User ID:", req.body.userId);
        
        // TODO: In the future, send req.file.path to Python/AI here
        
        return res.json({ status: "success", message: "File received properly" });
    } else {
        console.log("❌ NO FILE DETECTED");
        return res.status(400).json({ status: "error", message: "No file found" });
    }
});




// Get all transactions for a user
router.get('/user/:userId', async (req, res) => {
  try {
    const { limit = 50, page = 1, category } = req.query;
    const skip = (page - 1) * limit;

    const filter = { userId: req.params.userId };
    if (category) filter.category = category;

    const transactions = await Transaction.find(filter)
      .sort({ timestamp: -1 })
      .limit(parseInt(limit))
      .skip(skip);

    const total = await Transaction.countDocuments(filter);

    res.json({
      success: true,
      transactions,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Create new transaction
router.post('/', async (req, res) => {
  try {
    const transaction = await Transaction.create(req.body);
    res.status(201).json({
      success: true,
      transaction
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
});

// Get transaction by ID
// router.get('/:txId', async (req, res) => {
//   try {
//     const transaction = await Transaction.findOne({ txId: req.params.txId });
    
//     if (!transaction) {
//       return res.status(404).json({
//         success: false,
//         error: 'Transaction not found'
//       });
//     }

//     res.json({
//       success: true,
//       transaction
//     });
//   } catch (error) {
//     res.status(500).json({
//       success: false,
//       error: error.message
//     });
//   }
// });

router.post("/manual", async (req, res) => {
  try {
    const body = req.body;

    if (!body.txId || !body.userId || !body.amountPaise) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const saved = await Transaction.create(body);
    res.status(201).json({ ok: true, saved });
  } 
  catch(error) 
  {
    console.log(error);
    res.status(500).json({ message: "Server error" });
  }
});


router.get("/manual-logs", async (req, res) => {
  try {
    const { userId, filter } = req.query;

    if (!userId) {
      return res.status(400).json({ message: "userId required" });
    }

    let finalUserId = userId.trim();
    let dateFilter = {};

    if (filter === "week") {
      const last7Days = new Date();
      last7Days.setDate(last7Days.getDate() - 7);
      dateFilter = { timestamp: { $gte: last7Days } };
    }


    if (filter === "month") {
      const date = new Date();
      date.setMonth(date.getMonth() - 1);
      dateFilter = { timestamp: { $gte: date } };
    }

    const transactions = await Transaction.find({
      userId: finalUserId,
      source: "manual",
      ...dateFilter
    })
      .sort({ timestamp: -1 })
      .limit(50);

    res.json({ transactions });
  } catch (err) {
    console.error("Manual fetch error:", err);
    res.status(500).json({ message: "Server error" });
  }
});


module.exports = router;