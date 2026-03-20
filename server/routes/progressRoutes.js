const express = require('express');
const router = express.Router();
const ProgressReport = require('../models/progressReport');
const { authenticateToken } = require('../middleware/auth');

// Get user progress
router.get('/', authenticateToken, async (req, res) => {
  try {
    const progress = await ProgressReport.find({ user: req.user.userId })
      .populate('lesson', 'lesson_title grade');
    res.json(progress);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get progress for specific lesson
router.get('/lesson/:lessonId', authenticateToken, async (req, res) => {
  try {
    const progress = await ProgressReport.findOne({ user: req.user.userId, lesson: req.params.lessonId });
    res.json(progress || { completed: false, score: 0 });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update progress
router.post('/lesson/:lessonId', authenticateToken, async (req, res) => {
  try {
    const { completed, score } = req.body;
    const progress = await ProgressReport.findOneAndUpdate(
      { user: req.user.userId, lesson: req.params.lessonId },
      { completed, score, last_updated: new Date() },
      { upsert: true, new: true }
    );
    res.json(progress);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Get all students' progress (for teachers)
router.get('/students', authenticateToken, async (req, res) => {
  try {
    if (!['admin', 'teacher'].includes(req.user.effectiveRole)) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const progress = await ProgressReport.find({})
      .populate('user', 'username email')
      .populate('lesson', 'lesson_title grade');
    res.json(progress);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;