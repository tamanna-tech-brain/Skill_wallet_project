const Joi = require('joi');

const lockSeatsSchema = Joi.object({
  showtimeId: Joi.string().required(),
  seatNumbers: Joi.array().items(Joi.string()).min(1).max(10).required(),
});

const confirmBookingSchema = Joi.object({
  showtimeId: Joi.string().required(),
  seatNumbers: Joi.array().items(Joi.string()).min(1).max(10).required(),
});

const cancelBookingSchema = Joi.object({
  reason: Joi.string().optional(),
});

module.exports = { lockSeatsSchema, confirmBookingSchema, cancelBookingSchema };
