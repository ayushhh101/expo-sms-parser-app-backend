const mongoose = require('mongoose');

const NotificationSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
    index: true
  },
  
  msg_type: {
    type: String,
    enum: ['admin_side', 'transaction', 'alert', 'tip', 'goal', 'challenge'],
    default: 'admin_side'
  },

  msg_head: {
    type: String,
    required: true
  },
  
  msg_content: {
    type: String,
    required: true
  },
  
  transactionId: {
    type: String,
    default: null
  },
  isRead: {
    type: Boolean,
    default: false
  },

  timestamp: {
    type: Date,
    default: Date.now
  }
}, {
  collection: 'notifications' 
});

module.exports = mongoose.model('Notification', NotificationSchema);