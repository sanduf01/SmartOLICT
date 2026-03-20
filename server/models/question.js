const mongoose = require("mongoose");

const questionSchema = new mongoose.Schema({
  question_id: String,
  question_text: String,
  question_type: String,
  options: [String],
  correct_answer: String,
  difficulty_level: String,
  points_value: Number,
  quiz_id: { type: mongoose.Schema.Types.ObjectId, ref: "Quiz" }
});
module.exports = mongoose.model("Question", questionSchema);