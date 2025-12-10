const mongoose = require("mongoose");

const DailyChallengeSchema = new mongoose.Schema(
  {
    challengeId: { type: String, required: true },
    userId: { type: String, required: true },

    title: { type: String },
    description: { type: String },
    category: { type: String },

    type: {
      type: String,
      enum: ["active", "completed", "expired"],
      default: "active",
    },

    status: {
      type: String,
      enum: ["active", "completed", "expired"],
      default: "active",
    },

    icon: { type: String },
    color: { type: String },
    btnText: { type: String },

    amountPaise: { type: Number },
    rewardPaise: { type: Number },
    difficulty: { type: String },
    priority: { type: Number },

    streakContribution: { type: Number },
    isExpired: { type: Boolean, default: false },

    completionData: {
      actualAmountPaise: { type: Number },
      completedAt: { type: Date },
    },

    aiGeneratedAt: { type: Date },
    dateAssigned: { type: Date },
  },
  { timestamps: true }
);

module.exports = mongoose.model("DailyChallenge", DailyChallengeSchema);
