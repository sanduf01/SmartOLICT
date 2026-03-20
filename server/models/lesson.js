const mongoose = require('mongoose');

const lessonSchema = new mongoose.Schema(
  {
    lesson_title: { type: String, required: true },
    lesson_content: { type: String, required: true },

    grade: { type: String, required: true }, // "10" | "11"
    duration: { type: Number },

    // h5p OR video OR youtube
    content_type: {
      type: String,
      enum: ['h5p', 'video', 'youtube'],
    },

    // h5p embed url OR uploaded video path
    content_url: {
      type: String,
    },

    // Reference to video file metadata (for video content_type only)
    video_file_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'VideoFile',
      default: null
    },

    // Image URL for lesson card background (in dynamic-lesson page)
    image_url: {
      type: String,
      default: null
    },

    status: { type: String, default: 'active' }, // active | deleted
    deleted_date: Date
  },
  { timestamps: true }
);

module.exports = mongoose.model('Lesson', lessonSchema);