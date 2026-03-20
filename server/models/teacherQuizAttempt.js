const mongoose = require("mongoose");

const teacherQuizAttemptSchema = new mongoose.Schema({
  attempt_id: String,
  user_id: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  quiz_id: { type: mongoose.Schema.Types.ObjectId, ref: "Quiz" },
  start_time: Date,
  end_time: Date,
  score_earned: Number,
  total_possible_score: Number,
  status: String,
  user_role: String // 'teacher' or 'admin'
});

module.exports = mongoose.model("TeacherQuizAttempt", teacherQuizAttemptSchema);

