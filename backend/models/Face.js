const mongoose = require('mongoose');

const faceSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  visitor_of: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  face_url: {
    type: String,
    required: true,
  },
  created_at: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('Face', faceSchema);
