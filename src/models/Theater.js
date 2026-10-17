const mongoose = require('mongoose');

const TheaterSchema = new mongoose.Schema({
  name: { type: String, required: [true, 'Theater name is required'], trim: true },
  address: {
    street: { type: String },
    city: { type: String, required: [true, 'City is required'] },
    state: { type: String },
    pincode: { type: String },
  },
  contactPhone: { type: String },
  email: { type: String },
  isActive: { type: Boolean, default: true },
}, { timestamps: true });

TheaterSchema.index({ 'address.city': 1 });

module.exports = mongoose.model('Theater', TheaterSchema);
