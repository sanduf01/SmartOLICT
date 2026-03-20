const express = require('express');
const router = express.Router();
const Lesson = require('../models/lesson');
const VideoFile = require('../models/videoFile');
const { authenticateToken } = require('../middleware/auth');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

/* ===========================
   Video Upload Configuration
=========================== */
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = './uploads/videos';
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});

const upload = multer({ storage });

/* ===========================
   Image Upload Configuration (for lesson cards)
=========================== */
const imageStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = './uploads/images';
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});

const uploadImage = multer({ storage: imageStorage });

// Image upload endpoint for lesson card
router.post(
  '/upload-image',
  authenticateToken,
  uploadImage.single('image'),
  async (req, res) => {
    if (!req.file) {
      return res.status(400).json({ message: 'No image uploaded' });
    }

    try {
      res.json({
        image_url: `/uploads/images/${req.file.filename}`
      });
    } catch (error) {
      console.error('Error saving image:', error);
      res.status(500).json({ message: 'Error saving image' });
    }
  }
);

router.post(
  '/upload-video',
  authenticateToken,
  upload.single('video'),
  async (req, res) => {
    if (!req.file) {
      return res.status(400).json({ message: 'No video uploaded' });
    }

    try {
      // Save video file metadata to database
      const videoFile = new VideoFile({
        filename: req.file.filename,
        originalname: req.file.originalname,
        mimetype: req.file.mimetype,
        size: req.file.size,
        path: req.file.path,
        url: `/uploads/videos/${req.file.filename}`,
        uploaded_by: req.user.userId,
        file_type: 'video',
        status: 'active'
      });

      await videoFile.save();

      // Link video file to lesson if lesson_id is provided
      if (req.body.lesson_id) {
        await VideoFile.findByIdAndUpdate(videoFile._id, {
          lesson_id: req.body.lesson_id
        });
      }

      res.json({
        content_type: 'video',
        content_url: `/uploads/videos/${req.file.filename}`,
        video_file_id: videoFile._id
      });
    } catch (error) {
      console.error('Error saving video file metadata:', error);
      res.status(500).json({ message: 'Error saving video file metadata' });
    }
  }
);

/* ===========================
   Lesson CRUD
=========================== */

// Get all active lessons
router.get('/', authenticateToken, async (req, res) => {
  const lessons = await Lesson.find({ status: 'active' }).sort({ createdAt: 1 });
  res.json(lessons);
});

// Get lessons by grade
router.get('/grade/:grade', authenticateToken, async (req, res) => {
  const lessons = await Lesson.find({
    grade: req.params.grade,
    status: 'active'
  }).sort({ createdAt: 1 });

  res.json(lessons);
});

// Get single lesson
router.get('/:id', authenticateToken, async (req, res) => {
  const lesson = await Lesson.findById(req.params.id);
  if (!lesson) return res.status(404).json({ message: 'Lesson not found' });
  res.json(lesson);
});

// Create lesson
router.post('/', authenticateToken, async (req, res) => {
  if (!['admin', 'teacher'].includes(req.user.effectiveRole)) {
    return res.status(403).json({ message: 'Access denied' });
  }

  const lesson = new Lesson(req.body);
  const saved = await lesson.save();
  res.status(201).json(saved);
});

// Update lesson
router.put('/:id', authenticateToken, async (req, res) => {
  if (!['admin', 'teacher'].includes(req.user.effectiveRole)) {
    return res.status(403).json({ message: 'Access denied' });
  }

  const lesson = await Lesson.findByIdAndUpdate(
    req.params.id,
    req.body,
    { new: true }
  );

  res.json(lesson);
});

// Soft delete
router.delete('/:id', authenticateToken, async (req, res) => {
  if (!['admin', 'teacher'].includes(req.user.effectiveRole)) {
    return res.status(403).json({ message: 'Access denied' });
  }

  await Lesson.findByIdAndUpdate(req.params.id, {
    status: 'deleted',
    deleted_date: new Date()
  });

  res.json({ message: 'Lesson moved to recycle bin' });
});

// Get deleted lessons
router.get('/deleted/all', authenticateToken, async (req, res) => {
  if (!['admin', 'teacher'].includes(req.user.effectiveRole)) {
    return res.status(403).json({ message: 'Access denied' });
  }

  const lessons = await Lesson.find({ status: 'deleted' }).sort({ deleted_date: -1 });
  res.json(lessons);
});

// Restore lesson
router.post('/:id/restore', authenticateToken, async (req, res) => {
  if (!['admin', 'teacher'].includes(req.user.effectiveRole)) {
    return res.status(403).json({ message: 'Access denied' });
  }

  const lesson = await Lesson.findByIdAndUpdate(
    req.params.id,
    { status: 'active', $unset: { deleted_date: 1 } },
    { new: true }
  );

  if (!lesson) return res.status(404).json({ message: 'Lesson not found' });
  res.json({ message: 'Lesson restored successfully' });
});

// Permanently delete lesson
router.delete('/:id/permanent', authenticateToken, async (req, res) => {
  if (!['admin'].includes(req.user.effectiveRole)) {
    return res.status(403).json({ message: 'Access denied - only admins can permanently delete' });
  }

  const lesson = await Lesson.findByIdAndDelete(req.params.id);
  if (!lesson) return res.status(404).json({ message: 'Lesson not found' });
  res.json({ message: 'Lesson permanently deleted' });
});

module.exports = router;
