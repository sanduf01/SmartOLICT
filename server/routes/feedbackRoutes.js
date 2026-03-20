const express = require('express');
const router = express.Router();
const Feedback = require('../models/feedback');
const { authenticateToken } = require('../middleware/auth');

// POST new feedback
router.post('/', async (req, res) => {
  try {
    const { feedback_content, rating, category, student_id, quiz_id } = req.body;

    if (!feedback_content || !rating || !category) {
      return res.status(400).json({ message: 'Feedback content, rating, and category are required' });
    }

    const newFeedback = new Feedback({
      feedback_id: 'F' + Date.now(),
      student_id,
      quiz_id,
      feedback_content,
      rating,
      category
    });

    const savedFeedback = await newFeedback.save();
    res.status(201).json(savedFeedback);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// GET all feedback
router.get('/', async (req, res) => {
  try {
    const feedbacks = await Feedback.find().populate('student_id', 'firstName lastName').sort({ created_at: -1 });
    res.json(feedbacks);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// UPDATE feedback
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const { feedback_content, rating, category } = req.body;

    // Find the feedback first to check ownership
    const existingFeedback = await Feedback.findById(req.params.id);
    if (!existingFeedback) {
      return res.status(404).json({ message: 'Feedback not found' });
    }

    // Check if user owns this feedback (optional - remove if not needed)
    // if (existingFeedback.student_id.toString() !== req.body.student_id) {
    //   return res.status(403).json({ message: 'You can only edit your own feedback' });
    // }

    const updateData = {};
    if (feedback_content !== undefined) updateData.feedback_content = feedback_content;
    if (rating !== undefined) updateData.rating = rating;
    if (category !== undefined) updateData.category = category;

    const feedback = await Feedback.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true }
    );

    res.json(feedback);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// DELETE feedback
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    // Find the feedback first to check ownership
    const existingFeedback = await Feedback.findById(req.params.id);
    if (!existingFeedback) {
      return res.status(404).json({ message: 'Feedback not found' });
    }

    // Check if user owns this feedback
    if (existingFeedback.student_id.toString() !== req.user.userId) {
      return res.status(403).json({ message: 'You can only delete your own feedback' });
    }

    await Feedback.findByIdAndDelete(req.params.id);
    res.json({ message: 'Feedback deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
