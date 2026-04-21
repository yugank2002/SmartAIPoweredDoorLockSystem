const mongoose = require('mongoose');

const visitorSchema = new mongoose.Schema({
  face_url: {
    type: String,
    required: true
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  visitor_of: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Visitor', visitorSchema);
