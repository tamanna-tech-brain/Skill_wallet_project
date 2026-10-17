const mongoose = require('mongoose');

const ScreenSchema = new mongoose.Schema({
  theater: { type: mongoose.Schema.Types.ObjectId, ref: 'Theater', required: true },
  screenName: { type: String, required: [true, 'Screen name is required'], trim: true },
  format: { type: String, enum: ['2D', '3D', 'IMAX', '4DX'], default: '2D' },
  totalSeats: { type: Number, required: [true, 'Total seats required'] },
  layout: {
    rows: { type: Number, required: true },
    columns: { type: Number, required: true },
    seatCategories: [{
      category: { type: String, enum: ['Standard', 'Premium', 'VIP'] },
      rows: [String],
      price: Number,
    }],
  },
  isActive: { type: Boolean, default: true },
}, { timestamps: true });

ScreenSchema.index({ theater: 1 });

module.exports = mongoose.model('Screen', ScreenSchema);
