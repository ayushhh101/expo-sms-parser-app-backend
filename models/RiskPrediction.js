const mongoose = require('mongoose');

const RiskPredictionSchema = new mongoose.Schema({
  user_id: { 
    type: String, 
    required: true, 
    index: true 
  },
  
  // Overall risk assessment
  score: { 
    type: Number, 
    min: 0, 
    max: 100, 
    required: true 
  },
  level: { 
    type: String, 
    enum: ['Low', 'Medium', 'High', 'Critical'], 
    required: true 
  },
  
  // Individual risk items (embedded directly)
  predicted_risks: [{
    id: { type: String, required: true }, // stable id like "income_drop_week"
    severity: { 
      type: String, 
      enum: ['info', 'warning', 'high', 'critical'], 
      required: true 
    },
    score: { 
      type: Number, 
      min: 0, 
      max: 100, 
      required: true 
    },
    message: { type: String, required: true }, // short human-readable reason
    numbers: { 
      type: Map, 
      of: Number,
      default: {} 
    }, // supporting metrics (avg, forecast, delta)
    category: { 
      type: String, 
      enum: ['fuel', 'food', 'recharge', 'transport', 'income', 'expense', 'saving', 'all'],
      default: 'all'
    },
    time_window: {
      from: Date,
      to: Date
    },
    suggestion: String, // short action/nudge
    persona_message: {
      en: String,
      hi: String
    }
  }],
  
  // Numeric features for explainability
  features: {
    income_drop_prob: { type: Number, min: 0.0, max: 1.0, default: 0.0 },
    expense_spike_ratio: { type: Number, min: 0.0, max: 1.0, default: 0.0 },
    near_zero_prob: { type: Number, min: 0.0, max: 1.0, default: 0.0 },
    festival_risk: { type: Number, min: 0.0, max: 1.0, default: 0.0 },
    emi_flag: { type: Number, min: 0.0, max: 1.0, default: 0.0 },
    savings_depletion_risk: { type: Number, min: 0.0, max: 1.0, default: 0.0 },
    irregular_income_pattern: { type: Number, min: 0.0, max: 1.0, default: 0.0 }
  },
  
  // Forecasting data
  forecast_next_7_days: [Number], // optional array of numeric forecasts
  
  // Metadata
  computed_at: { type: Date, default: Date.now },
  valid_until: { type: Date, required: true },
  source: { type: String, default: 'full_eval_v1' }, // pipeline id
  version: { type: Number, default: 1 },
  
  // User feedback
  feedback_flags: {
    helpful: { type: Number, default: 0 },
    not_helpful: { type: Number, default: 0 },
    false_positive: { type: Number, default: 0 },
    acted_upon: { type: Number, default: 0 }
  }
}, {
  timestamps: true
});

// Indexes for efficient queries
RiskPredictionSchema.index({ user_id: 1, computed_at: -1 });
RiskPredictionSchema.index({ user_id: 1, level: 1 });
RiskPredictionSchema.index({ valid_until: 1 }); // for cleanup of expired predictions
RiskPredictionSchema.index({ 'predicted_risks.severity': 1 });

// Virtual for checking if prediction is still valid
RiskPredictionSchema.virtual('isValid').get(function() {
  return this.valid_until > new Date();
});

// Virtual for time until expiry
RiskPredictionSchema.virtual('hoursUntilExpiry').get(function() {
  const now = new Date();
  const diff = this.valid_until - now;
  return Math.max(0, Math.floor(diff / (1000 * 60 * 60)));
});

// Static method to get latest valid prediction for user
RiskPredictionSchema.statics.getLatestValidPrediction = function(user_id) {
  return this.findOne({
    user_id,
    valid_until: { $gt: new Date() }
  }).sort({ computed_at: -1 });
};

// Static method to get risk history for user
RiskPredictionSchema.statics.getRiskHistory = function(user_id, limit = 10) {
  return this.find({ user_id })
    .sort({ computed_at: -1 })
    .limit(limit)
    .select('score level computed_at predicted_risks.length features');
};

// Static method to get critical risks across all users (for admin)
RiskPredictionSchema.statics.getCriticalRisks = function() {
  return this.find({
    level: { $in: ['High', 'Critical'] },
    valid_until: { $gt: new Date() }
  })
  .sort({ score: -1 })
  .limit(50);
};

// Method to add user feedback
RiskPredictionSchema.methods.addFeedback = function(feedbackType, increment = 1) {
  if (this.feedback_flags.hasOwnProperty(feedbackType)) {
    this.feedback_flags[feedbackType] += increment;
    return this.save();
  }
  throw new Error(`Invalid feedback type: ${feedbackType}`);
};

// Method to check if specific risk exists
RiskPredictionSchema.methods.hasRisk = function(riskId) {
  return this.predicted_risks.some(risk => risk.id === riskId);
};

// Method to get risks by severity
RiskPredictionSchema.methods.getRisksBySeverity = function(severity) {
  return this.predicted_risks.filter(risk => risk.severity === severity);
};

// Method to get risks by category
RiskPredictionSchema.methods.getRisksByCategory = function(category) {
  return this.predicted_risks.filter(risk => risk.category === category);
};

// Pre-save middleware to calculate overall score and level
RiskPredictionSchema.pre('save', function(next) {
  // Auto-calculate level based on score if not provided
  if (this.score !== undefined && !this.isModified('level')) {
    if (this.score >= 80) {
      this.level = 'Critical';
    } else if (this.score >= 60) {
      this.level = 'High';
    } else if (this.score >= 30) {
      this.level = 'Medium';
    } else {
      this.level = 'Low';
    }
  }
  
  // Set valid_until if not provided (default 24 hours)
  if (!this.valid_until) {
    this.valid_until = new Date(Date.now() + 24 * 60 * 60 * 1000);
  }
  
  next();
});

module.exports = mongoose.model('RiskPrediction', RiskPredictionSchema);