const mongoose = require('mongoose');

const LifeEventSchema = new mongoose.Schema({
  eventId: { type: String, unique: true },
  userId: { type: String, index: true },
  type: String, // birthday | festival | wedding | school_fee | other
  description: String,
  eventDate: Date,
  expectedCostPaise: Number,
  status: String,
  note: String,
  daysUntil: Number,
  savingsPlanNeeded: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('LifeEvent', LifeEventSchema);