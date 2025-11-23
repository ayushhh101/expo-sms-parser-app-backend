const mongoose = require('mongoose');

const TransactionSchema = new mongoose.Schema({
  txId: { type: String, unique: true }, // tx_xxx
  userId: { type: String, index: true },
  eventId: { type: String, index: true, default: null }, // link to Event
  clientLocalId: { type: String, index: true }, // for idempotency from device
  type: { type: String, enum: ['income','expense','transfer'], required: true },
  amountPaise: { type: Number, required: true }, // ₹ -> paise
  category: { type: String, index: true }, // e.g. gig_payout, fuel, food, rent, other
  merchant: String,
  method: { type: String, enum: ['cash','upi','bank','wallet'], default: 'cash' },
  timestamp: { type: Date, required: true },
  source: { type: String, enum: ['sms','voice','manual','quicktap'], default: 'manual' },
  parserMeta: {
    parser: String, // 'regex'|'openai'
    confidence: Number,
    rawParse: Object
  },
  notes: String,
  synced: { type: Boolean, default: false }, // synced to server canonical record (client-side)
  createdAt: { type: Date, default: Date.now },
  updatedAt: Date
});

// Indexes to optimize queries
TransactionSchema.index({ userId: 1, timestamp: -1 });
TransactionSchema.index({ userId: 1, category: 1 });
TransactionSchema.index({ clientLocalId: 1 });

module.exports = mongoose.model('Transaction', TransactionSchema);