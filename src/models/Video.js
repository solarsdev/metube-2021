import mongoose from 'mongoose';

const videoSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true, maxLength: 80 },
  description: { type: String, trim: true, minLength: 10 },
  createdAt: { type: Date, required: true, default: Date.now },
  hashtags: [{ type: String, trim: true }],
  meta: {
    views: { type: Number, required: true, default: 0 },
    rating: { type: Number, required: true, default: 0 },
  },
  fileInfo: {
    job: {
      id: { type: String, index: true },
      status: String,
    },
    videoKey: String,
  },
  owner: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'User' },
});

videoSchema.static('transformHashtags', (hashtags) => {
  return hashtags.split(',').map((hashtag) => (hashtag.startsWith('#') ? hashtag : `#${hashtag}`));
});

const Video = mongoose.model('Video', videoSchema);

export default Video;
