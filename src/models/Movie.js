const mongoose = require('mongoose');

const MovieSchema = new mongoose.Schema({
  title: { type: String, required: [true, 'Title is required'], trim: true },
  description: { type: String, required: [true, 'Description is required'] },
  genre: [{ type: String, trim: true }],
  language: [{ type: String, trim: true }],
  duration: { type: Number, required: [true, 'Duration (minutes) is required'] },
  releaseDate: { type: Date, required: [true, 'Release date is required'] },
  director: { type: String, trim: true },
  cast: [{
    name: { type: String },
    role: { type: String },
  }],
  posterUrl: { type: String },
  trailerUrl: { type: String },
  rating: {
    imdb: { type: Number, min: 0, max: 10, default: 0 },
    internal: { type: Number, min: 0, max: 5, default: 0 },
  },
  format: [{ type: String, enum: ['2D', '3D', 'IMAX', '4DX'] }],
  status: {
    type: String,
    enum: ['now_showing', 'upcoming', 'expired'],
    default: 'upcoming',
  },
  isActive: { type: Boolean, default: true },
}, { timestamps: true });

MovieSchema.index({ title: 'text' }, { language_override: 'none' });
MovieSchema.index({ genre: 1 });
MovieSchema.index({ status: 1 });
MovieSchema.index({ releaseDate: 1 });

module.exports = mongoose.model('Movie', MovieSchema);
