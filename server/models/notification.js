const mongoose = require("mongoose");

const notificationSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },

  desc: {
    type: String,
    required: true
  },

  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },

  isGlobal: {
    type: Boolean,
    default: true
  },

  isRead: {
    type: Boolean,
    default: false
  },

  targetUsers: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: "User"
  }],

  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model("Notification", notificationSchema);
