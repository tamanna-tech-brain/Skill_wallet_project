const mongoose = require('mongoose');

const ShowtimeSchema = new mongoose.Schema({
  movie:   { type: mongoose.Schema.Types.ObjectId, ref: 'Movie',   required: true },
  screen:  { type: mongoose.Schema.Types.ObjectId, ref: 'Screen',  required: true },
  theater: { type: mongoose.Schema.Types.ObjectId, ref: 'Theater', required: true },
  startTime: { type: Date, required: [true, 'Start time is required'] },
  endTime:   { type: Date, required: [true, 'End time is required'] },
  language: { type: String, required: [true, 'Language is required'] },
  format:   { type: String, enum: ['2D', '3D', 'IMAX', '4DX'], default: '2D' },
  ticketPrice: {
    standard: { type: Number, default: 150 },
    premium:  { type: Number, default: 250 },
    vip:      { type: Number, default: 450 },
  },
  totalSeats:     { type: Number, default: 0 },
  availableSeats: { type: Number, default: 0 },
  status: {
    type: String,
    enum: ['scheduled', 'ongoing', 'completed', 'cancelled'],
    default: 'scheduled',
  },
}, { timestamps: true });

ShowtimeSchema.index({ movie: 1, startTime: 1 });
ShowtimeSchema.index({ screen: 1, startTime: 1 });
ShowtimeSchema.index({ theater: 1, startTime: 1 });
ShowtimeSchema.index({ status: 1 });

module.exports = mongoose.model('Showtime', ShowtimeSchema);
