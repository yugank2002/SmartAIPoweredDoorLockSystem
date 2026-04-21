const express = require('express');
const { protect } = require('../middleware/auth');
const History = require('../models/History');

const router = express.Router();

// @route GET /api/history
// @desc Get history records for the authenticated user
// @access Private
router.get('/', protect, async (req, res) => {
  try {
    const userId = req.userId;
    const history = await History.find({ userId }).sort({ timestamp: -1 });
    res.status(200).json({ success: true, history });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;