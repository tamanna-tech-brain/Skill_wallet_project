const mongoose = require('mongoose');

const SeatSchema = new mongoose.Schema({
  showtime:   { type: mongoose.Schema.Types.ObjectId, ref: 'Showtime', required: true },
  screen:     { type: mongoose.Schema.Types.ObjectId, ref: 'Screen',  required: true },
  seatNumber: { type: String, required: true },   // "A1", "B5"
  row:        { type: String, required: true },
  column:     { type: Number, required: true },
  category:   { type: String, enum: ['Standard', 'Premium', 'VIP'], default: 'Standard' },
  price:      { type: Number, required: true },
  status: {
    type: String,
    enum: ['available', 'locked', 'booked'],
    default: 'available',
  },
  lockedBy:    { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  lockedUntil: { type: Date, default: null },
  booking:     { type: mongoose.Schema.Types.ObjectId, ref: 'Booking', default: null },
}, { timestamps: true });

SeatSchema.index({ showtime: 1, seatNumber: 1 }, { unique: true });
SeatSchema.index({ showtime: 1, status: 1 });
SeatSchema.index({ lockedUntil: 1 }, { expireAfterSeconds: 0 });

module.exports = mongoose.model('Seat', SeatSchema);
