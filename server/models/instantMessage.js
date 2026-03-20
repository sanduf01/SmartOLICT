const mongoose = require("mongoose");

const messageSchema = new mongoose.Schema({
  message_id: String,
  sender_id: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  message_content: String,
  date: Date,
  time: String});
module.exports = mongoose.model("InstantMessage", messageSchema);