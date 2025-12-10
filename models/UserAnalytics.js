// models/UserAnalytics.js
const mongoose = require("mongoose");

const UserAnalyticsSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  raw_monthly_aggregates: [
    {
      _id: String, // e.g., "2025-10"
      totalIncome: Number,
      totalExpenses: Number,
      categories: [
        {
          category: String,
          amountPaise: Number,
          type: String // "expense" or "income"
        }
      ]
    }
  ],
  monthly_timeseries: [
    {
      month: String, // e.g., "2025-10"
      income: Number,
      expenses: Number,
      savings: Number,
      transactionCount: Number
    }
  ]
}, { collection: 'useranalytics' }); // <--- CHECK YOUR DB COLLECTION NAME

module.exports = mongoose.model("UserAnalytics", UserAnalyticsSchema);