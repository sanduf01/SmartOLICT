const mongoose = require("mongoose");

const progressReportSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  lesson: { type: mongoose.Schema.Types.ObjectId, ref: "Lesson", required: true },
  completed: { type: Boolean, default: false },
  score: { type: Number, default: 0 },
  last_updated: { type: Date, default: Date.now },
  report_id: String,
  student_id: { type: mongoose.Schema.Types.ObjectId, ref: "Student" },
  generated_date: Date,
  weak_areas: [String],
  recommendations: [String]});
  // average_score, overall_progress → derived});
module.exports = mongoose.model("ProgressReport", progressReportSchema);
 