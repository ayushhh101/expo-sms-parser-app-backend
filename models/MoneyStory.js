const mongoose = require('mongoose');

const MoneyStorySchema = new mongoose.Schema({
  userId: { type: String, required: true },
  month: Number,
  monthly_summ_head: String,
  monthly_summ_content: String,
  earning_head: String,
  earning_content: String,
  spike_header: String,
  spike_content: String,
  smart_header: String,
  smart_content: String,
  timestamp: { type: Date, default: Date.now }
}, { 
  // 👇 THIS LINE FIXES IT
  collection: 'stories_agent' 
});

module.exports = mongoose.model('MoneyStory', MoneyStorySchema);