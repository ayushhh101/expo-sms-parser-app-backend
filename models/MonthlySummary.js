const mongoose = require("mongoose");

const MonthlySummarySchema = new mongoose.Schema({
  userId: { type: String, required: true },
  year: Number,
  month: Number,
  summary: {
    incomeExpense: [
      {
        _id: String, // "income" or "expense"
        totalAmount: Number // In Paise
      }
    ],
    biggestSpike: {
      category: String,
      amount: Number, // In Rupees
      percent: Number
    }
    // ... we don't need to define every single field, just what we use
  }
}, { collection: 'monthly_summary' }); // <--- Matches your collection name

module.exports = mongoose.model("MonthlySummary", MonthlySummarySchema);