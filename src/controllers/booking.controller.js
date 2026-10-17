const bookingService = require('../services/booking.service');
const { success, created, paginated } = require('../utils/apiResponse');

exports.lockSeats = async (req, res, next) => {
  try {
    const result = await bookingService.lockSeats(req.user._id, req.body.showtimeId, req.body.seatNumbers);
    return success(res, result, 'Seats locked for 10 minutes');
  } catch (err) { next(err); }
};

exports.confirmBooking = async (req, res, next) => {
  try {
    const booking = await bookingService.confirmBooking(req.user._id, req.body.showtimeId, req.body.seatNumbers);
    return created(res, { booking }, 'Booking confirmed');
  } catch (err) { next(err); }
};

exports.getUserBookings = async (req, res, next) => {
  try {
    const result = await bookingService.getUserBookings(req.user._id, req.query);
    return paginated(res, result.bookings, result.pagination, 'Bookings fetched');
  } catch (err) { next(err); }
};

exports.getBookingById = async (req, res, next) => {
  try {
    const booking = await bookingService.getBookingById(req.params.id, req.user._id);
    return success(res, { booking }, 'Booking fetched');
  } catch (err) { next(err); }
};

exports.getBookingByRef = async (req, res, next) => {
  try {
    const Booking = require('../models/Booking');
    const booking = await Booking.findOne({ bookingRef: req.params.bookingRef, user: req.user._id })
      .populate('showtime movie theater seats');
    if (!booking) {
      const err = new Error('Booking not found.');
      err.statusCode = 404;
      throw err;
    }
    return success(res, { booking }, 'Booking fetched');
  } catch (err) { next(err); }
};

exports.cancelBooking = async (req, res, next) => {
  try {
    const booking = await bookingService.cancelBooking(req.params.id, req.user._id, req.body?.reason);
    return success(res, { booking }, 'Booking cancelled successfully');
  } catch (err) { next(err); }
};
