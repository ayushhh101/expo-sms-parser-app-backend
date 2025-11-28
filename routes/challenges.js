const express = require('express');
const router = express.Router();
const Challenge = require('../models/Challenge');

// Get today's challenges for a user
router.get('/today/:userId', async (req, res) => {
  try {
    const challenges = await Challenge.getTodaysChallenges(req.params.userId);
    
    // Calculate total potential savings for today
    const totalPotentialSavings = challenges.reduce((sum, challenge) => {
      return sum + (challenge.rewardAmountPaise || 0);
    }, 0);
    
    // Count completed challenges today
    const completedToday = challenges.filter(c => c.status === 'completed').length;
    
    res.json({
      success: true,
      data: {
        challenges,
        summary: {
          totalChallenges: challenges.length,
          completedToday,
          pendingChallenges: challenges.filter(c => c.status === 'pending').length,
          totalPotentialSavingsPaise: totalPotentialSavings,
          totalPotentialSavingsRupees: Math.floor(totalPotentialSavings / 100)
        }
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Get user's challenge statistics
router.get('/stats/:userId', async (req, res) => {
  try {
    const { timeRange = 'month' } = req.query;
    const stats = await Challenge.getUserStats(req.params.userId, timeRange);
    
    // Calculate total saved this month
    const totalSavedPaise = Object.values(stats.stats).reduce((sum, stat) => {
      return sum + (stat.totalSavedPaise || 0);
    }, 0);
    
    res.json({
      success: true,
      data: {
        ...stats,
        totalSavedThisMonthPaise: totalSavedPaise,
        totalSavedThisMonthRupees: Math.floor(totalSavedPaise / 100),
        completedChallenges: stats.stats.completed?.count || 0,
        currentStreak: stats.currentStreak
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Mark challenge as completed
router.post('/:challengeId/complete', async (req, res) => {
  try {
    const challenge = await Challenge.findOne({ challengeId: req.params.challengeId });
    
    if (!challenge) {
      return res.status(404).json({
        success: false,
        error: 'Challenge not found'
      });
    }
    
    if (challenge.status !== 'pending') {
      return res.status(400).json({
        success: false,
        error: 'Challenge is not in pending status'
      });
    }
    
    // Mark as completed with optional completion data
    await challenge.markAsCompleted(req.body.completionData || {});
    
    res.json({
      success: true,
      message: 'Challenge completed successfully!',
      challenge,
      rewardEarned: challenge.rewardAmountPaise
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Mark challenge as skipped
router.post('/:challengeId/skip', async (req, res) => {
  try {
    const challenge = await Challenge.findOne({ challengeId: req.params.challengeId });
    
    if (!challenge) {
      return res.status(404).json({
        success: false,
        error: 'Challenge not found'
      });
    }
    
    await challenge.markAsSkipped();
    
    res.json({
      success: true,
      message: 'Challenge skipped',
      challenge
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Get challenge history for a user
router.get('/history/:userId', async (req, res) => {
  try {
    const { limit = 50, page = 1, status, category } = req.query;
    const skip = (page - 1) * limit;
    
    const filter = { userId: req.params.userId };
    if (status) filter.status = status;
    if (category) filter.category = category;
    
    const challenges = await Challenge.find(filter)
      .sort({ dateAssigned: -1 })
      .limit(parseInt(limit))
      .skip(skip);
    
    const total = await Challenge.countDocuments(filter);
    
    res.json({
      success: true,
      data: {
        challenges,
        pagination: {
          total,
          page: parseInt(page),
          limit: parseInt(limit),
          totalPages: Math.ceil(total / limit)
        }
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Create new challenge (for AI agent to call)
router.post('/', async (req, res) => {
  try {
    const challengeData = {
      challengeId: req.body.challengeId || `challenge_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
      ...req.body,
      aiGeneratedAt: new Date(),
      dateAssigned: req.body.dateAssigned || new Date()
    };
    
    const challenge = await Challenge.create(challengeData);
    
    res.status(201).json({
      success: true,
      challenge
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
});

// Bulk create challenges (for AI agent daily generation)
router.post('/bulk-create', async (req, res) => {
  try {
    const { challenges } = req.body;
    
    if (!Array.isArray(challenges)) {
      return res.status(400).json({
        success: false,
        error: 'Challenges must be an array'
      });
    }
    
    // Add metadata to each challenge
    const challengesWithMeta = challenges.map(challenge => ({
      challengeId: challenge.challengeId || `challenge_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
      ...challenge,
      aiGeneratedAt: new Date(),
      dateAssigned: challenge.dateAssigned || new Date()
    }));
    
    const createdChallenges = await Challenge.insertMany(challengesWithMeta);
    
    res.status(201).json({
      success: true,
      message: `Created ${createdChallenges.length} challenges`,
      challenges: createdChallenges
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
});

module.exports = router;