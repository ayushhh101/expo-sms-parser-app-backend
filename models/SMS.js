const mongoose = require('mongoose');

const smsSchema = new mongoose.Schema({
  sender: {
    type: String,
    required: true,
  },
  message: {
    type: String,
    required: true,
  },
  timestamp: {
    type: Date,
    default: Date.now,
  },
  category: {
    type: String,
    enum: ['transaction', 'promotional', 'otp', 'other'],
    default: 'other',
  },
  amount: {
    type: Number,
    default: null,
  },
  metadata: {
    type: Object,
    default: {},
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('SMS', smsSchema);
