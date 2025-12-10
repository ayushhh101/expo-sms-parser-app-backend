const mongoose = require('mongoose');

const DailyCashflowSchema = new mongoose.Schema({
  userId: { type: String, ref: 'User', required: true, index: true },
  date: { type: Date, required: true }, 
  
  income: { type: Number, default: 0 },   
  expense: { type: Number, default: 0 },  
  net: { type: Number, default: 0 },      
  
  status: { 
    type: String, 
    enum: ['high_earning', 'balanced', 'heavy_expense', 'neutral'], 
    default: 'neutral' 
  },
  
  lastUpdated: { type: Date, default: Date.now }
});

//  unique entry per user per day
DailyCashflowSchema.index({ userId: 1, date: 1 }, { unique: true });

module.exports = mongoose.model('DailyCashflow', DailyCashflowSchema);