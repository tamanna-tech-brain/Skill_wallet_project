const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');

const BookingSchema = new mongoose.Schema({
  bookingRef: {
    type: String,
    unique: true,
    default: () => `IMV-${uuidv4().slice(0, 8).toUpperCase()}`,
  },
  user:     { type: mongoose.Schema.Types.ObjectId, ref: 'User',     required: true },
  showtime: { type: mongoose.Schema.Types.ObjectId, ref: 'Showtime', required: true },
  movie:    { type: mongoose.Schema.Types.ObjectId, ref: 'Movie' },
  theater:  { type: mongoose.Schema.Types.ObjectId, ref: 'Theater' },
  seats:    [{ type: mongoose.Schema.Types.ObjectId, ref: 'Seat' }],
  seatNumbers: [String],       // denormalized: ["A1", "A2"]
  totalAmount: { type: Number, required: true },
  paymentStatus: {
    type: String,
    enum: ['pending', 'paid', 'refunded'],
    default: 'pending',
  },
  status: {
    type: String,
    enum: ['confirmed', 'cancelled', 'expired'],
    default: 'confirmed',
  },
  cancelledAt: { type: Date },
  cancellationReason: { type: String },
}, { timestamps: true });

BookingSchema.index({ user: 1, createdAt: -1 });
BookingSchema.index({ showtime: 1 });

module.exports = mongoose.model('Booking', BookingSchema);
