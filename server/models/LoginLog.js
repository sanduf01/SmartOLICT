const mongoose = require("mongoose");

const loginLogSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },

  username: {
    type: String,
    required: true
  },

  email: {
    type: String,
    required: true
  },

  role_used: {
    type: String,
    enum: ["student", "teacher", "admin"],
    required: true
  },

  provider: {
    type: String,
    enum: ["local", "google"],
    default: "local"
  },

  login_time: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model("LoginLog", loginLogSchema);