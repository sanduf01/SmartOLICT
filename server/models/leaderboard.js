const mongoose = require("mongoose");

const leaderboardSchema = new mongoose.Schema({
  entry_id: String,
  student_id: { type: mongoose.Schema.Types.ObjectId, ref: "Student" },
  total_points: Number,
  rank_position: Number,
  period: String,
  last_updated: Date});
module.exports = mongoose.model("Leaderboard", leaderboardSchema);