const mongoose = require('mongoose');

const ShiftSchema = new mongoose.Schema({
  days: [String], // ["monday","tuesday"...]
  slot: { type: String },// "morning|afternoon|evening|night"
  startTime: String, // "06:00"
  endTime: String, // "12:00"
  hours: Number
}, { _id: false });

const WorkProfileSchema = new mongoose.Schema({
  primary_work_type: String,
  platforms: [String],
  work_days: [String],
  off_days: [String],
  total_weekly_hours: Number,
  avg_daily_hours_weekday: Number,
  avg_daily_hours_weekend: Number
}, { _id: false });

/**
 * Single compact User schema with embedded financial_profile and ai_context.
 * All money fields stored as integers in paise (multiply rupees * 100 before saving).
 */
const UserSchema = new mongoose.Schema({
  userId: { type: String, index: true, unique: true }, // e.g. usr_rahul_001
  name: String,
  age: Number,
  city: String,
  phone: String,
  preferred_language: { type: String, default: 'hindi' },
  onboarding_completed_at: Date,

  permissions: {
    sms_access: { type: Boolean, default: false },
    notifications: { type: Boolean, default: true },
    location: { type: Boolean, default: false }
  },

  work_profile: WorkProfileSchema,

  // ---- financial_profile (compact) ----
  financial_profile: {
    monthly_income: {
      estimatedAmountPaise: { type: Number, default: 0 },
      stability: { type: String, enum: ['stable','variable','unknown'], default: 'variable' },
      sources: { type: [String], default: [] }
    },

    fixed_monthly_expenses: {
      rentPaise: { type: Number, default: 0 },
      electricity_waterPaise: { type: Number, default: 0 },
      phone_internetPaise: { type: Number, default: 0 },
      totalPaise: { type: Number, default: 0 } // computed
    },

    variable_monthly_expenses: {
      food_groceriesPaise: { type: Number, default: 0 },
      fuel_maintenancePaise: { type: Number, default: 0 },
      entertainment_otherPaise: { type: Number, default: 0 },
      totalPaise: { type: Number, default: 0 } // computed
    },

    total_monthly_expensesPaise: { type: Number, default: 0 }, // computed
    potential_monthly_savingsPaise: { type: Number, default: 0 },// computed

    // small analytics snapshot for quick prompts (keep updated by server jobs)
    analytics: {
      work_days_per_week: { type: Number, default: 0 },
      total_weekly_hours: { type: Number, default: 0 },
      estimated_hourly_ratePaise: { type: Number, default: 0 },
      income_expense_ratio: { type: Number, default: 0 },
      savings_rate_percent: { type: Number, default: 0 }
    }
  }, // end financial_profile

  // ---- tiny AI context (embedded to keep everything in one schema) ----
  ai_context: {
    context_service: { type: String, default: "" },
    saving_context: { type: String, default: "" },
    goal_context: { type: String, default: "" },
    current_stat_context: { type: String, default: "" },
    daily_spend_context_goal: { type: String, default: "" },
    monthly_spend_context_goal: { type: String, default: "" }
  },

  createdAt: { type: Date, default: Date.now },
  updatedAt: Date
});

module.exports = mongoose.model('User', UserSchema);