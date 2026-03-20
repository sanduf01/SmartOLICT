const mongoose = require("mongoose");

const teacherSchema = new mongoose.Schema({
  user_id: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  subject_specialization: String});
module.exports = mongoose.model("Teacher", teacherSchema);