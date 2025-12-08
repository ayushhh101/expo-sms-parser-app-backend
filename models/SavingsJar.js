const mongoose = require('mongoose');

const SavingsJarSchema = new mongoose.Schema({
  // --- OWNER ---
  userId: {
    type: String, // Or mongoose.Schema.Types.ObjectId if using User model
    required: true,
    index: true
  },

  // --- CORE INFO ---
  title: {
    type: String,
    required: true,
    trim: true
  },
  
  // --- FINANCIALS ---
  target: {
    type: Number,
    required: true,
    min: 1
  },
  saved: {
    type: Number,
    default: 0,
    min: 0
  },

  // --- LOGIC ---
  deadline: {
    type: Date,
    required: true
  },
  status: {
    type: String,
    enum: ['active', 'completed', 'archived'],
    default: 'active'
  },

  // --- UI STYLING (Stores frontend look) ---
  icon: { type: String, default: "piggy-bank" }, // MCI Icon name
  color: { type: String, default: "#10B981" },   // Hex color
  bg: { type: String, default: "bg-slate-800" },  // Tailwind class

  // --- HISTORY (Optional: Tracks every deposit) ---
  transactions: [{
    amount: Number,
    date: { type: Date, default: Date.now }
  }]

}, {
  timestamps: true,
  toJSON: { virtuals: true }, // IMPORTANT: Send virtuals to React
  toObject: { virtuals: true }
});

// --- VIRTUAL 1: SUGGESTED AMOUNT ---
// Calculates how much to save daily to hit the target
SavingsJarSchema.virtual('suggested_amt').get(function() {
  if (this.saved >= this.target) return 0;

  const now = new Date();
  const deadlineDate = new Date(this.deadline);
  
  // Calculate milliseconds per day
  const oneDay = 24 * 60 * 60 * 1000;
  
  // Calculate days left (ceil ensures we count partial days as 1)
  let daysLeft = Math.ceil((deadlineDate - now) / oneDay);
  
  // If deadline is passed or today, set daysLeft to 1 to avoid division by zero
  if (daysLeft < 1) daysLeft = 1;

  const remaining = this.target - this.saved;
  
  // Return the rounded up amount needed per day
  return Math.ceil(remaining / daysLeft);
});

// --- VIRTUAL 2: DEADLINE DAYS ---
// "23 days left"
SavingsJarSchema.virtual('deadline_days').get(function() {
  const now = new Date();
  const deadlineDate = new Date(this.deadline);
  const oneDay = 24 * 60 * 60 * 1000;
  const diff = Math.ceil((deadlineDate - now) / oneDay);
  return diff > 0 ? diff : 0;
});

module.exports = mongoose.model('SavingsJar', SavingsJarSchema);