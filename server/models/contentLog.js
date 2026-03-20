const mongoose = require("mongoose");

const contentLogSchema = new mongoose.Schema({
  log_id: String,
  admin_id: { type: mongoose.Schema.Types.ObjectId, ref: "Admin" },
  action_type: String,
  content_type: String,
  description: String,
  timestamp: Date});
module.exports = mongoose.model("ContentLog", contentLogSchema);