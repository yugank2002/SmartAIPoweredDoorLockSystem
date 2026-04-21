const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs').promises;
const Face = require('../models/Face');
const User = require('../models/User');
const authMiddleware = require('../middleware/auth');

const router = express.Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: async (req, file, cb) => {
    try {
      const userId = req.userId;
      const visitorName = req.body.visitor_name;
      
      if (!visitorName) {
        return cb(new Error('visitor_name is required'));
      }

      // Create directory path: static/{userId}/{visitorName}/
      const dir = path.join(__dirname, '..', 'static', userId, visitorName);
      
      // Create directory if it doesn't exist
      await fs.mkdir(dir, { recursive: true });
      
      cb(null, dir);
    } catch (error) {
      cb(error);
    }
  },
  filename: (req, file, cb) => {
    // Save as photo.jpg
    cb(null, 'photo.jpg');
  },
});

const upload = multer({ 
  storage,
  fileFilter: (req, file, cb) => {
    // Accept image files only
    const allowedMimes = ['image/jpeg', 'image/png', 'image/gif'];
    if (allowedMimes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only images are allowed.'));
    }
  },
});

// Register a new face (visitor)
router.post('/:userId/faces', authMiddleware, upload.single('face_image'), async (req, res) => {
  try {
    const { userId } = req.params;
    const { visitor_name } = req.body;

    // Verify the userId matches the authenticated user
    if (userId !== req.userId) {
      return res.status(403).json({ error: 'Unauthorized to register faces for another user' });
    }

    if (!visitor_name || !req.file) {
      return res.status(400).json({ error: 'visitor_name and face_image are required' });
    }

    // Verify user exists
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Create face record with the relative URL path
    const faceUrl = `/${userId}/${visitor_name}/photo.jpg`;

    const newFace = new Face({
      name: visitor_name,
      visitor_of: userId,
      face_url: faceUrl,
    });

    await newFace.save();

    return res.status(201).json({
      message: 'Face registered successfully',
      face: {
        id: newFace._id,
        name: newFace.name,
        face_url: newFace.face_url,
        visitor_of: newFace.visitor_of,
        created_at: newFace.created_at,
      },
    });
  } catch (error) {
    console.error('Register face error:', error);
    return res.status(500).json({ error: error.message || 'Server error' });
  }
});

// Get all faces for current user
router.get('/faces', authMiddleware, async (req, res) => {
  try {
    const faces = await Face.find({ visitor_of: req.userId }).sort({ created_at: -1 });

    return res.json({
      faces: faces.map(face => ({
        id: face._id,
        name: face.name,
        face_url: face.face_url,
        visitor_of: face.visitor_of,
        created_at: face.created_at,
      })),
    });
  } catch (error) {
    console.error('Get faces error:', error);
    return res.status(500).json({ error: 'Server error' });
  }
});

// Delete a face
router.delete('/faces/:faceId', authMiddleware, async (req, res) => {
  try {
    const { faceId } = req.params;

    // Find and delete the face
    const face = await Face.findById(faceId);

    if (!face) {
      return res.status(404).json({ error: 'Face not found' });
    }

    // Verify ownership
    if (face.visitor_of.toString() !== req.userId) {
      return res.status(403).json({ error: 'Unauthorized to delete this face' });
    }

    await Face.findByIdAndDelete(faceId);

    // Optionally delete the file from storage
    try {
      const filePath = path.join(__dirname, '..', 'static', face.face_url);
      await fs.unlink(filePath);
    } catch (fileError) {
      console.warn('Could not delete file:', fileError.message);
    }

    return res.json({ message: 'Face deleted successfully' });
  } catch (error) {
    console.error('Delete face error:', error);
    return res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
