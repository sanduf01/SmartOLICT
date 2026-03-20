const mongoose = require('mongoose');

const videoFileSchema = new mongoose.Schema(
  {
    filename: { type: String, required: true },
    originalname: { type: String, required: true },
    mimetype: { type: String, required: true },
    size: { type: Number, required: true },
    path: { type: String, required: true },
    url: { type: String, required: true },
    uploaded_by: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    file_type: { type: String, default: 'video' },
    status: { type: String, default: 'active' },
    lesson_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Lesson',
      default: null
    }
  },
  { timestamps: { createdAt: 'created_date', updatedAt: true } }
);

module.exports = mongoose.model('VideoFile', videoFileSchema);
