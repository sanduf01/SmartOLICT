const express = require('express');
const router = express.Router();
const Question = require('../models/question');
const { authenticateToken } = require('../middleware/auth');

// Get all questions
router.get('/', authenticateToken, async (req, res) => {
  try {
    const questions = await Question.find();
    res.json(questions);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get questions by quiz
router.get('/quiz/:quizId', authenticateToken, async (req, res) => {
  try {
    const questions = await Question.find({ quiz_id: req.params.quizId });
    res.json(questions);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get specific question
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const question = await Question.findById(req.params.id);
    if (!question) return res.status(404).json({ message: 'Question not found' });
    res.json(question);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create question
router.post('/', authenticateToken, async (req, res) => {
  if (!['admin', 'teacher'].includes(req.user.effectiveRole)) {
    return res.status(403).json({ message: 'Access denied' });
  }

  const question = new Question(req.body);
  try {
    const newQuestion = await question.save();
    res.status(201).json(newQuestion);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Update question
router.put('/:id', authenticateToken, async (req, res) => {
  if (!['admin', 'teacher'].includes(req.user.effectiveRole)) {
    return res.status(403).json({ message: 'Access denied' });
  }

  try {
    const question = await Question.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!question) return res.status(404).json({ message: 'Question not found' });
    res.json(question);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Delete question
router.delete('/:id', authenticateToken, async (req, res) => {
  if (!['admin', 'teacher'].includes(req.user.effectiveRole)) {
    return res.status(403).json({ message: 'Access denied' });
  }

  try {
    const question = await Question.findByIdAndDelete(req.params.id);
    if (!question) return res.status(404).json({ message: 'Question not found' });
    res.json({ message: 'Question deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
