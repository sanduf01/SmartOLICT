const mongoose = require("mongoose");

const quizSchema = new mongoose.Schema({
  quiz_id: String,
  quiz_title: String,
  quiz_type: String,
  time_limit: Number,
  total_questions: Number,
  grade: { type: String, required: true }, // Add grade field
  lesson_id: { type: mongoose.Schema.Types.ObjectId, ref: "Lesson" },
  questions: [{ type: mongoose.Schema.Types.ObjectId, ref: "Question" }],
  status: { type: String, default: 'active' }, // active, deleted
  created_date: Date,
  deleted_date: Date
});
module.exports = mongoose.model("Quiz", quizSchema);