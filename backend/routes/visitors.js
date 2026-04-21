const express = require('express');
const path = require('path');
const fs = require('fs');
const multer = require('multer');
const { protect } = require('../middleware/auth');
const Visitor = require('../models/Visitor');

const router = express.Router();

// Multer storage configuration: store in /static/<userId>/photos
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const userId = req.userId;
    const dest = path.join(__dirname, '..', 'static', String(userId), 'photos');
    fs.mkdirSync(dest, { recursive: true });
    cb(null, dest);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const safeName = file.originalname.replace(/[^a-zA-Z0-9.\-]/g, '_');
    cb(null, uniqueSuffix + '-' + safeName);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: function (req, file, cb) {
    if (!file.mimetype.startsWith('image/')) {
      return cb(new Error('Only image files are allowed'));
    }
    cb(null, true);
  }
});

// @route POST /api/visitors
// @desc Add a visitor (photo + name)
// @access Private
router.post('/', protect, upload.single('photo'), async (req, res) => {
  try {
    const userId = req.userId;
    const name = req.body.name;

    if (!req.file) {
      return res.status(400).json({ success: false, message: 'Photo is required' });
    }

    if (!name) {
      return res.status(400).json({ success: false, message: 'Visitor name is required' });
    }

    const relativePath = path.join('static', String(userId), 'photos', req.file.filename).replace(/\\/g, '/');
    const face_url = `/${relativePath}`; // e.g. /static/<userId>/photos/<file>

    const visitor = new Visitor({
      face_url,
      name,
      visitor_of: userId
    });

    await visitor.save();

    res.status(201).json({ success: true, visitor });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route GET /api/visitors
// @desc List visitors for the authenticated user
// @access Private
router.get('/', protect, async (req, res) => {
  try {
    const userId = req.userId;
    const visitors = await Visitor.find({ visitor_of: userId }).sort({ createdAt: -1 });
    res.status(200).json({ success: true, visitors });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route DELETE /api/visitors/:id
// @desc Delete a visitor and remove photo from static folder
// @access Private
router.delete('/:id', protect, async (req, res) => {
  try {
    const visitorId = req.params.id;
    const userId = req.userId;

    // Find the visitor
    const visitor = await Visitor.findById(visitorId);

    if (!visitor) {
      return res.status(404).json({ success: false, message: 'Visitor not found' });
    }

    // Ensure user owns this visitor
    if (visitor.visitor_of.toString() !== userId) {
      return res.status(403).json({ success: false, message: 'Not authorized to delete this visitor' });
    }

    // Extract filename from face_url (e.g., /static/userId/photos/filename.jpg -> filename.jpg)
    const photoPath = path.join(__dirname, '..', visitor.face_url);

    // Delete photo file from static folder
    if (fs.existsSync(photoPath)) {
      try {
        fs.unlinkSync(photoPath);
      } catch (fileError) {
        console.error('Error deleting photo file:', fileError);
        // Continue even if file deletion fails
      }
    }

    // Delete visitor from database
    await Visitor.findByIdAndDelete(visitorId);

    res.status(200).json({ success: true, message: 'Visitor deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
