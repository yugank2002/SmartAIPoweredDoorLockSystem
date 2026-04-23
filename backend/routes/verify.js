const express = require('express');
const path = require('path');
const fs = require('fs');
const multer = require('multer');
const axios = require('axios');
const FormData = require('form-data');
const Visitor = require('../models/Visitor');
const History = require('../models/History');

const router = express.Router();

// Multer for temporary storage of probe image
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: function (req, file, cb) {
    if (!file.mimetype.startsWith('image/')) {
      return cb(new Error('Only image files are allowed'));
    }
    cb(null, true);
  }
});

// Python deepface microservice URL
const DEEPFACE_SERVICE_URL = process.env.DEEPFACE_SERVICE_URL || 'http://localhost:5001';

// @route POST /api/verify
// @desc Verify a captured photo against visitor database (1:N matching)
// @access Public (can be protected later if needed)
router.post('/', upload.single('photo'), async (req, res) => {
  try {
    const userId = req.body.userId || req.query.userId;
    
    if (!userId) {
      return res.status(400).json({ success: false, message: 'userId is required' });
    }

    if (!req.file) {
      return res.status(400).json({ success: false, message: 'Photo is required' });
    }

    // Path to user's visitor photos folder
    const visitorFolder = path.join(__dirname, '..', 'static', String(userId), 'photos');

    // Check if folder exists
    if (!fs.existsSync(visitorFolder)) {
      return res.status(200).json({
        success: true,
        message: 'No visitor database found for this user',
        userId,
        matches: [],
        best_match: null
      });
    }

    // Send to Python deepface service
    const formData = new FormData();
    formData.append('probe_image', req.file.buffer, {
      filename: 'capture.jpg',
      contentType: 'image/jpeg'
    });
    formData.append('reference_folder', visitorFolder);

    try {
      const deepfaceResponse = await axios.post(
        `${DEEPFACE_SERVICE_URL}/match`,
        formData,
        {
          headers: formData.getHeaders(),
          timeout: 180000 // 180 seconds (3 min) - first run downloads models (~150MB)
        }
      );

      // Determine if access should be allowed or rejected
      // Allowed if best_match exists and is verified (distance below threshold)
      console.log(deepfaceResponse.data);
      const bestMatch = deepfaceResponse.data.best_match;
      const decision = (bestMatch && bestMatch.verified) ? 'allowed' : 'rejected';
      
      let visitorName = 'Unknown Visitor';
      let visitorImageUrl = null;
      
      if (bestMatch && bestMatch.verified) {
        // Find the visitor by face_url
        const referenceImage = bestMatch.reference_image;
        const expectedFaceUrl = `/static/${userId}/photos/${referenceImage}`;
        const visitor = await Visitor.findOne({ visitor_of: userId, face_url: expectedFaceUrl });
        if (visitor) {
          visitorName = visitor.name;
          visitorImageUrl = visitor.face_url;
        } else {
          // Fallback to extracting from filename
          visitorName = referenceImage.split(/[.-]/).slice(0, -1).join(' ');
        }
      }

      // Save history record with photo
      const historyDir = path.join(__dirname, '..', 'static', String(userId), 'history');
      fs.mkdirSync(historyDir, { recursive: true });
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
      const historyFilename = `capture-${uniqueSuffix}.jpg`;
      const historyPath = path.join(historyDir, historyFilename);
      
      // Save the captured image to history folder
      fs.writeFileSync(historyPath, req.file.buffer);
      
      const relativePath = path.join('static', String(userId), 'history', historyFilename).replace(/\\/g, '/');
      const photoUrl = `/${relativePath}`;

      try {
        const historyRecord = new History({
          userId,
          visitorName,
          decision,
          photoUrl,
          visitorImageUrl
        });
        await historyRecord.save();
      } catch (historyError) {
        console.error('Error saving history:', historyError);
        // Continue with response even if history save fails
      }

      // Return decision to client
      return res.status(200).json({
        success: true,
        userId,
        decision,
        visitorName,
        best_match: bestMatch,
        all_matches: deepfaceResponse.data.matches
      });
    } catch (deepfaceError) {
      console.error('Deepface service error:', deepfaceError.message);
      return res.status(500).json({
        success: false,
        message: 'Face matching service error: ' + (deepfaceError.message || 'Unknown error'),
        userId
      });
    }

  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
