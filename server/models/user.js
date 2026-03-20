const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  // Optional external ID (Google, etc.)
  user_id: {
    type: String
  },

  username: {
    type: String,
    required: function () {
      return this.providers && this.providers.includes("local");
    }
  },

  firstName: {
    type: String,
    required: true
  },

  lastName: {
    type: String,
    required: true
  },

  email: {
    type: String,
    unique: true,
    required: true,
    lowercase: true,
    index: true
  },

  password: {
    type: String,
    required: function () {
      return this.providers && this.providers.includes("local");
    }
  },

  role: {
    type: String,
    enum: ["student", "teacher", "admin"],
    required: true
  },

  providers: [{
    type: String,
    enum: ["local", "google"],
    required: true
  }],

  profileImage: {
    type: String, // Base64 encoded image or URL
    default: null
  },

  registration_date: {
    type: Date,
    default: Date.now
  },

  last_login: {
    type: Date
  }
});

module.exports = mongoose.model("User", userSchema);
