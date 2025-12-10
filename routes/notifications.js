const express = require('express');
const router = express.Router();
const Notification = require('../models/Notification');


router.get('/:userId', async (req, res) => {
  try {
    const { userId } = req.params;

    
    const notifications = await Notification.find({ userId })
      .sort({ timestamp: -1 })
      .limit(50); 

    res.status(200).json({ 
      success: true, 
      count: notifications.length,
      data: notifications 
    });

  } catch (error) {
    console.error("Error fetching notifications:", error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
});


router.put('/mark-read/:userId', async (req, res) => {
  try {
    const { userId } = req.params;

    const result = await Notification.updateMany(
      { userId: userId }, 
      { $set: { isRead: true } }
    );

    res.status(200).json({ 
      success: true, 
      message: "Marked all as read",
      updatedCount: result.modifiedCount 
    });

  } catch (error) {
    console.error("Mark read error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
});

router.post('/', async (req, res) => {
  try {
    const newNotif = await Notification.create(req.body);
    res.status(201).json({ success: true, data: newNotif });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

module.exports = router;