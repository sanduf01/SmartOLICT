const mongoose = require("mongoose");

const studentSchema = new mongoose.Schema({
  user_id: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  grade_level: String
});

module.exports = mongoose.model("Student", studentSchema);