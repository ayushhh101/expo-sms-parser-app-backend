const mongoose = require('mongoose');

const RiskAnalysisSchema = new mongoose.Schema({
  userId: { 
    type: String, 
    required: true, 
    index: true 
  },
  
  month: { 
    type: String, 
    required: true,
    index: true
  },
  
  // Balance projections
  balance_today_rupees: { 
    type: Number, 
    required: true 
  },
  balance_plus_2days_rupees: { 
    type: Number, 
    required: true 
  },
  balance_plus_4days_rupees: { 
    type: Number, 
    required: true 
  },
  
  // Spending metrics
  current_spending_rupees: { 
    type: Number, 
    required: true 
  },
  normal_spending_rupees: { 
    type: Number, 
    required: true 
  },
  extra_amount_rupees: { 
    type: Number, 
    required: true 
  },
  
  // Risk indicators
  days_until_zero: { 
    type: Number, 
    required: true 
  },
  
  // High risk alert
  high_risk_category: { 
    type: String, 
    required: true 
  },
  high_risk_head: { 
    type: String, 
    required: true 
  },
  high_risk_description: { 
    type: String, 
    required: true 
  },
  
  // Medium risk alert
  medium_risk_head: { 
    type: String, 
    required: true 
  },
  medium_risk_description: { 
    type: String, 
    required: true 
  },
  
  // Pattern detection
  highest_spending_day: { 
    type: String, 
    required: true 
  },
  pattern_detected_head: { 
    type: String, 
    required: true 
  },
  pattern_detected_description: { 
    type: String, 
    required: true 
  },
  
  // Predicted risks array
  three_predicted_risks: [{
    title: { 
      type: String, 
      required: true 
    },
    description: { 
      type: String, 
      required: true 
    },
    riskLevel: { 
      type: String, 
      enum: ['low', 'medium', 'high', 'critical'],
      required: true 
    }
  }],
  
  generatedAt: { 
    type: Date, 
    default: Date.now,
    index: true
  }
}, {
  timestamps: true,
  collection: 'riskpredictions' // Use the existing collection name
});

// Compound index for efficient querying
RiskAnalysisSchema.index({ userId: 1, month: 1 });
RiskAnalysisSchema.index({ userId: 1, generatedAt: -1 });

// Static method to get latest analysis for user
RiskAnalysisSchema.statics.getLatestAnalysis = function(userId, month = null) {
  const query = { userId };
  if (month) {
    query.month = month;
  }
  return this.findOne(query).sort({ generatedAt: -1 });
};

// Static method to get analysis history
RiskAnalysisSchema.statics.getAnalysisHistory = function(userId, limit = 10) {
  return this.find({ userId })
    .sort({ generatedAt: -1 })
    .limit(limit);
};

// Method to get high severity risks
RiskAnalysisSchema.methods.getHighSeverityRisks = function() {
  return this.three_predicted_risks.filter(
    risk => risk.riskLevel === 'high' || risk.riskLevel === 'critical'
  );
};

// Method to check if balance is critical
RiskAnalysisSchema.methods.isCriticalBalance = function() {
  return this.days_until_zero <= 7;
};

// Virtual for overall risk level
RiskAnalysisSchema.virtual('overallRiskLevel').get(function() {
  const highRisks = this.three_predicted_risks.filter(
    r => r.riskLevel === 'high' || r.riskLevel === 'critical'
  );
  
  if (highRisks.length >= 2 || this.days_until_zero <= 7) {
    return 'critical';
  } else if (highRisks.length === 1 || this.days_until_zero <= 30) {
    return 'high';
  } else {
    return 'medium';
  }
});

module.exports = mongoose.model('RiskAnalysis', RiskAnalysisSchema);
