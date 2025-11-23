const mongoose = require('mongoose');

const GoalSchema = new mongoose.Schema({
  goalId: { type: String, unique: true },
  userId: { type: String, index: true },
  type: String, // e.g. phone_purchase
  description: String,
  targetAmountPaise: Number,
  currentAmountPaise: { type: Number, default: 0 },
  remainingAmountPaise: Number,
  deadline: Date,
  monthsRemaining: Number,
  requiredMonthlySavingsPaise: Number,
  requiredWeeklySavingsPaise: Number,
  requiredDailySavingsPaise: Number,
  priority: { type: String, enum: ['low','medium','high'], default: 'medium' },
  feasibility: { type: String }, // 'easy','challenging', etc
  gapPaise: Number, // optional supplemental metric
  autoAdjustEnabled: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: Date
});

module.exports = mongoose.model('Goal', GoalSchema);