const mongoose = require("mongoose");

const feedbackSchema = new mongoose.Schema({
  feedback_id: String,
  student_id: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  quiz_id: { type: mongoose.Schema.Types.ObjectId, ref: "Quiz" },
  feedback_content: String,
  rating: { type: Number, min: 1, max: 5 },
  category: { type: String, enum: ['general', 'bug', 'feature', 'ui', 'performance'] },
  created_at: { type: Date, default: Date.now }
});
module.exports = mongoose.model("Feedback", feedbackSchema);