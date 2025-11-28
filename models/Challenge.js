const mongoose = require('mongoose');

const ChallengeSchema = new mongoose.Schema({
  challengeId: { type: String, unique: true }, // challenge_20251128_save25
  userId: { type: String, index: true },
  
  // Challenge details
  title: { type: String, required: true }, // "Save ₹25 today"
  description: { type: String, required: true }, // "Put aside a small amount"
  category: { 
    type: String, 
    enum: ['saving', 'spending', 'transport', 'food', 'income', 'habit'], 
    required: true 
  },
  
  // Challenge values
  targetAmountPaise: { type: Number, default: 0 }, // ₹25 = 2500 paise
  rewardAmountPaise: { type: Number, default: 0 }, // +₹25 towards savings
  
  // Status and progress
  status: { 
    type: String, 
    enum: ['pending', 'completed', 'failed', 'skipped'], 
    default: 'pending' 
  },
  completedAt: { type: Date, default: null },
  
  // AI generation metadata
  aiGeneratedAt: { type: Date, default: Date.now },
  difficulty: { type: String, enum: ['easy', 'medium', 'hard'], default: 'easy' },
  priority: { type: Number, default: 1 }, // 1-5 priority for display order
  
  // Tracking
  dateAssigned: { type: Date, default: Date.now },
  isExpired: { type: Boolean, default: false },
  streakContribution: { type: Number, default: 1 }, // contributes to streak count
  
  // Validation for completion
  completionData: {
    actualAmountPaise: { type: Number, default: 0 },
    note: String,
    proofImageUrl: String, // optional proof image
    validatedAt: Date
  }
}, {
  timestamps: true
});

// Indexes for efficient queries
ChallengeSchema.index({ userId: 1, dateAssigned: -1 });
ChallengeSchema.index({ userId: 1, status: 1 });
ChallengeSchema.index({ dateAssigned: 1, status: 1 });

// Virtual for formatted date
ChallengeSchema.virtual('formattedDate').get(function() {
  return this.dateAssigned.toISOString().split('T')[0];
});

// Methods for challenge operations
ChallengeSchema.methods.markAsCompleted = function(completionData = {}) {
  this.status = 'completed';
  this.completedAt = new Date();
  this.completionData = {
    ...this.completionData,
    ...completionData,
    validatedAt: new Date()
  };
  return this.save();
};

ChallengeSchema.methods.markAsFailed = function() {
  this.status = 'failed';
  return this.save();
};

ChallengeSchema.methods.markAsSkipped = function() {
  this.status = 'skipped';
  return this.save();
};

// Static method to get today's challenges for a user
ChallengeSchema.statics.getTodaysChallenges = function(userId) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  
  return this.find({
    userId,
    dateAssigned: { $gte: today, $lt: tomorrow }
  }).sort({ priority: -1, createdAt: 1 });
};

// Static method to get user's challenge stats
ChallengeSchema.statics.getUserStats = async function(userId, timeRange = 'month') {
  const now = new Date();
  let startDate = new Date();
  
  switch(timeRange) {
    case 'week':
      startDate.setDate(now.getDate() - 7);
      break;
    case 'month':
      startDate.setMonth(now.getMonth() - 1);
      break;
    case 'year':
      startDate.setFullYear(now.getFullYear() - 1);
      break;
  }
  
  const stats = await this.aggregate([
    {
      $match: {
        userId,
        dateAssigned: { $gte: startDate }
      }
    },
    {
      $group: {
        _id: '$status',
        count: { $sum: 1 },
        totalSavedPaise: { 
          $sum: { 
            $cond: [
              { $eq: ['$status', 'completed'] },
              '$rewardAmountPaise',
              0
            ]
          }
        }
      }
    }
  ]);
  
  // Calculate streak
  const streak = await this.calculateStreak(userId);
  
  return {
    stats: stats.reduce((acc, stat) => {
      acc[stat._id] = {
        count: stat.count,
        totalSavedPaise: stat.totalSavedPaise
      };
      return acc;
    }, {}),
    currentStreak: streak,
    timeRange
  };
};

// Static method to calculate current streak
ChallengeSchema.statics.calculateStreak = async function(userId) {
  const challenges = await this.find({
    userId,
    status: { $in: ['completed'] }
  })
  .sort({ dateAssigned: -1 })
  .limit(30); // last 30 days
  
  let streak = 0;
  const today = new Date();
  
  for (let challenge of challenges) {
    const challengeDate = new Date(challenge.dateAssigned);
    const daysDiff = Math.floor((today - challengeDate) / (1000 * 60 * 60 * 24));
    
    if (daysDiff === streak) {
      streak++;
    } else {
      break;
    }
  }
  
  return streak;
};

module.exports = mongoose.model('Challenge', ChallengeSchema);