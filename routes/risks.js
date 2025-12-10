const express = require('express');
const router = express.Router();
const RiskPrediction = require('../models/RiskPrediction');
const RiskAnalysis = require('../models/RiskAnalysis');

// Get latest risk prediction for a user
router.get('/latest/:userId', async (req, res) => {
  try {
    const prediction = await RiskPrediction.getLatestValidPrediction(req.params.userId);
    
    if (!prediction) {
      return res.status(404).json({
        success: false,
        error: 'No valid risk prediction found for user'
      });
    }
    
    res.json({
      success: true,
      data: {
        prediction,
        isValid: prediction.isValid,
        hoursUntilExpiry: prediction.hoursUntilExpiry,
        criticalRisks: prediction.getRisksBySeverity('critical'),
        highRisks: prediction.getRisksBySeverity('high')
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Get risk prediction history for a user
router.get('/history/:userId', async (req, res) => {
  try {
    const { limit = 10 } = req.query;
    const history = await RiskPrediction.getRiskHistory(req.params.userId, parseInt(limit));
    
    // Calculate trend
    let trend = 'stable';
    if (history.length >= 2) {
      const latest = history[0].score;
      const previous = history[1].score;
      if (latest > previous + 10) trend = 'increasing';
      else if (latest < previous - 10) trend = 'decreasing';
    }
    
    res.json({
      success: true,
      data: {
        history,
        trend,
        totalPredictions: history.length
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Get risks by category for a user
router.get('/category/:userId/:category', async (req, res) => {
  try {
    const prediction = await RiskPrediction.getLatestValidPrediction(req.params.userId);
    
    if (!prediction) {
      return res.status(404).json({
        success: false,
        error: 'No valid risk prediction found'
      });
    }
    
    const categoryRisks = prediction.getRisksByCategory(req.params.category);
    
    res.json({
      success: true,
      data: {
        category: req.params.category,
        risks: categoryRisks,
        count: categoryRisks.length,
        overallScore: prediction.score,
        level: prediction.level
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Create or update risk prediction (for AI Agent)
router.post('/', async (req, res) => {
  try {
    const predictionData = {
      ...req.body,
      computed_at: new Date()
    };
    
    // Validate required fields
    if (!predictionData.user_id || predictionData.score === undefined) {
      return res.status(400).json({
        success: false,
        error: 'user_id and score are required fields'
      });
    }
    
    // Check if there's an existing valid prediction to replace
    const existingPrediction = await RiskPrediction.getLatestValidPrediction(predictionData.user_id);
    
    let prediction;
    if (existingPrediction && req.body.replace_existing !== false) {
      // Update existing prediction
      Object.assign(existingPrediction, predictionData);
      prediction = await existingPrediction.save();
    } else {
      // Create new prediction
      prediction = await RiskPrediction.create(predictionData);
    }
    
    res.status(201).json({
      success: true,
      message: 'Risk prediction created/updated successfully',
      data: {
        prediction,
        isValid: prediction.isValid,
        criticalRisks: prediction.getRisksBySeverity('critical').length,
        highRisks: prediction.getRisksBySeverity('high').length
      }
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
});

// Bulk create risk predictions (for AI Agent batch processing)
router.post('/bulk', async (req, res) => {
  try {
    const { predictions } = req.body;
    
    if (!Array.isArray(predictions)) {
      return res.status(400).json({
        success: false,
        error: 'predictions must be an array'
      });
    }
    
    const results = [];
    const errors = [];
    
    for (let predictionData of predictions) {
      try {
        predictionData.computed_at = new Date();
        const prediction = await RiskPrediction.create(predictionData);
        results.push(prediction);
      } catch (error) {
        errors.push({
          user_id: predictionData.user_id,
          error: error.message
        });
      }
    }
    
    res.status(201).json({
      success: true,
      message: `Created ${results.length} risk predictions`,
      data: {
        successful: results.length,
        failed: errors.length,
        errors: errors
      }
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
});

// Add user feedback to a risk prediction
router.post('/:predictionId/feedback', async (req, res) => {
  try {
    const { feedbackType, increment = 1 } = req.body;
    
    const prediction = await RiskPrediction.findById(req.params.predictionId);
    if (!prediction) {
      return res.status(404).json({
        success: false,
        error: 'Risk prediction not found'
      });
    }
    
    await prediction.addFeedback(feedbackType, increment);
    
    res.json({
      success: true,
      message: 'Feedback added successfully',
      feedback: prediction.feedback_flags
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
});

// Get critical risks across all users (admin endpoint)
router.get('/admin/critical', async (req, res) => {
  try {
    const criticalRisks = await RiskPrediction.getCriticalRisks();
    
    const summary = {
      totalCritical: criticalRisks.filter(r => r.level === 'Critical').length,
      totalHigh: criticalRisks.filter(r => r.level === 'High').length,
      avgScore: criticalRisks.reduce((sum, r) => sum + r.score, 0) / criticalRisks.length || 0
    };
    
    res.json({
      success: true,
      data: {
        criticalRisks,
        summary
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Get risk analytics for a user
router.get('/analytics/:userId', async (req, res) => {
  try {
    const { timeRange = 30 } = req.query;
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - parseInt(timeRange));
    
    const analytics = await RiskPrediction.aggregate([
      {
        $match: {
          user_id: req.params.userId,
          computed_at: { $gte: startDate }
        }
      },
      {
        $group: {
          _id: '$level',
          count: { $sum: 1 },
          avgScore: { $avg: '$score' },
          maxScore: { $max: '$score' },
          minScore: { $min: '$score' }
        }
      }
    ]);
    
    // Get feature trends
    const featureTrends = await RiskPrediction.find({
      user_id: req.params.userId,
      computed_at: { $gte: startDate }
    })
    .select('features computed_at')
    .sort({ computed_at: 1 })
    .limit(20);
    
    res.json({
      success: true,
      data: {
        levelDistribution: analytics,
        featureTrends,
        timeRange: parseInt(timeRange)
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Delete expired predictions (cleanup endpoint)
router.delete('/cleanup/expired', async (req, res) => {
  try {
    const result = await RiskPrediction.deleteMany({
      valid_until: { $lt: new Date() }
    });
    
    res.json({
      success: true,
      message: `Deleted ${result.deletedCount} expired predictions`
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Get comprehensive risk analysis for a user
router.get('/analysis/:userId', async (req, res) => {
  try {
    const { month } = req.query;
    
    // Get the latest risk analysis
    const riskAnalysis = await RiskAnalysis.getLatestAnalysis(req.params.userId, month);
    
    if (!riskAnalysis) {
      return res.status(404).json({
        success: false,
        error: 'No risk analysis found for user'
      });
    }
    
    // Add computed fields
    const response = {
      ...riskAnalysis.toObject(),
      overallRiskLevel: riskAnalysis.overallRiskLevel,
      isCritical: riskAnalysis.isCriticalBalance(),
      highSeverityRisks: riskAnalysis.getHighSeverityRisks()
    };
    
    res.json({
      success: true,
      data: response
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Get risk analysis history for a user
router.get('/analysis-history/:userId', async (req, res) => {
  try {
    const { limit = 10 } = req.query;
    const history = await RiskAnalysis.getAnalysisHistory(
      req.params.userId, 
      parseInt(limit)
    );
    
    res.json({
      success: true,
      data: {
        history,
        totalRecords: history.length
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Create new risk analysis
router.post('/analysis', async (req, res) => {
  try {
    const analysisData = {
      ...req.body,
      generatedAt: req.body.generatedAt || new Date()
    };
    
    // Validate required fields
    const requiredFields = [
      'userId', 'month', 'balance_today_rupees', 
      'current_spending_rupees', 'days_until_zero'
    ];
    
    for (const field of requiredFields) {
      if (analysisData[field] === undefined) {
        return res.status(400).json({
          success: false,
          error: `${field} is required`
        });
      }
    }
    
    const analysis = await RiskAnalysis.create(analysisData);
    
    res.status(201).json({
      success: true,
      message: 'Risk analysis created successfully',
      data: analysis
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
});

module.exports = router;