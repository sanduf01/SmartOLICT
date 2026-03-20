const mongoose = require("mongoose");

const quizAttemptSchema = new mongoose.Schema({
  attempt_id: String,
  student_id: { type: mongoose.Schema.Types.ObjectId, ref: "Student" },
  quiz_id: { type: mongoose.Schema.Types.ObjectId, ref: "Quiz" },
  start_time: Date,
  end_time: Date,
  score_earned: Number,
  total_possible_score: Number,
  status: String});
module.exports = mongoose.model("QuizAttempt", quizAttemptSchema);