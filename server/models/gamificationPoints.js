
const mongoose = require("mongoose");
const gamificationSchema = new mongoose.Schema({
  student_id: { type: mongoose.Schema.Types.ObjectId, ref: "Student" },
  points_value: Number,
  earned_date: Date});
module.exports = mongoose.model("GamificationPoints", gamificationSchema);