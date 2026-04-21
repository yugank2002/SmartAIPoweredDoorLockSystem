const mongoose = require('mongoose');

const historySchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  visitorName: {
    type: String,
    required: true,
    trim: true
  },
  decision: {
    type: String,
    enum: ['allowed', 'rejected'],
    required: true
  },
  timestamp: {
    type: Date,
    default: Date.now
  },
  photoUrl: {
    type: String,
    required: true
  },
  visitorImageUrl: {
    type: String,
    default: null
  }
});

module.exports = mongoose.model('History', historySchema);