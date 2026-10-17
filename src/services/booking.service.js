const mongoose = require('mongoose');
const Seat = require('../models/Seat');
const Booking = require('../models/Booking');
const Showtime = require('../models/Showtime');
const emailService = require('./email.service');
const { SEAT_LOCK_DURATION_MS, MAX_SEATS_PER_BOOKING, CANCELLATION_WINDOW_HOURS } = require('../utils/constants');

/**
 * Lock seats atomically — prevents race conditions
 */
const lockSeats = async (userId, showtimeId, seatNumbers) => {
  if (seatNumbers.length > MAX_SEATS_PER_BOOKING) {
    const err = new Error(`Cannot book more than ${MAX_SEATS_PER_BOOKING} seats at once.`);
    err.statusCode = 400;
    throw err;
  }

  const showtime = await Showtime.findById(showtimeId);
  if (!showtime || showtime.status !== 'scheduled') {
    const err = new Error('Showtime not found or not available for booking.');
    err.statusCode = 404;
    throw err;
  }

  const lockExpiry = new Date(Date.now() + SEAT_LOCK_DURATION_MS);
  const lockedSeats = [];
  const failedSeats = [];

  for (const seatNum of seatNumbers) {
    // Atomic conditional update — only locks if seat is truly available
    const seat = await Seat.findOneAndUpdate(
      {
        showtime: showtimeId,
        seatNumber: seatNum,
        $or: [
          { status: 'available' },
          { status: 'locked', lockedUntil: { $lt: new Date() } }, // expired lock
        ],
      },
      {
        $set: {
          status: 'locked',
          lockedBy: userId,
          lockedUntil: lockExpiry,
        },
      },
      { new: true }
    );

    if (seat) {
      lockedSeats.push(seat);
    } else {
      failedSeats.push(seatNum);
    }
  }

  // Rollback all locked seats if any seat failed
  if (failedSeats.length > 0) {
    await Seat.updateMany(
      { showtime: showtimeId, lockedBy: userId, status: 'locked' },
      { $set: { status: 'available', lockedBy: null, lockedUntil: null } }
    );
    const err = new Error(`Seats ${failedSeats.join(', ')} are no longer available.`);
    err.statusCode = 409;
    throw err;
  }

  const totalAmount = lockedSeats.reduce((sum, s) => sum + s.price, 0);
  return { lockedSeats: seatNumbers, lockExpiresAt: lockExpiry, totalAmount };
};

/**
 * Confirm booking after seats are locked
 */
const confirmBooking = async (userId, showtimeId, seatNumbers) => {
  // Verify all seats are locked by this user and not expired
  const seats = await Seat.find({
    showtime: showtimeId,
    seatNumber: { $in: seatNumbers },
    status: 'locked',
    lockedBy: userId,
    lockedUntil: { $gt: new Date() },
  });

  if (seats.length !== seatNumbers.length) {
    const err = new Error('Seat lock expired or seats not locked by you. Please re-select seats.');
    err.statusCode = 409;
    throw err;
  }

  const showtime = await Showtime.findById(showtimeId)
    .populate('movie', 'title')
    .populate('theater', 'name');

  const totalAmount = seats.reduce((sum, s) => sum + s.price, 0);

  // Create booking document
  const booking = await Booking.create({
    user: userId,
    showtime: showtimeId,
    movie: showtime.movie._id,
    theater: showtime.theater._id,
    seats: seats.map((s) => s._id),
    seatNumbers,
    totalAmount,
  });

  // Update each seat to booked
  await Seat.updateMany(
    { _id: { $in: seats.map((s) => s._id) } },
    { $set: { status: 'booked', booking: booking._id, lockedBy: null, lockedUntil: null } }
  );

  // Decrement available seats on showtime
  await Showtime.findByIdAndUpdate(showtimeId, { $inc: { availableSeats: -seatNumbers.length } });

  // Send confirmation email asynchronously (non-blocking)
  emailService.sendBookingConfirmation(userId, booking, showtime).catch(() => {});

  return booking;
};

/**
 * Get user booking history
 */
const getUserBookings = async (userId, { page = 1, limit = 10 }) => {
  const skip = (parseInt(page) - 1) * parseInt(limit);
  const [bookings, total] = await Promise.all([
    Booking.find({ user: userId })
      .populate('showtime', 'startTime endTime language format')
      .populate('movie', 'title posterUrl')
      .populate('theater', 'name address')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .lean(),
    Booking.countDocuments({ user: userId }),
  ]);
  return { bookings, pagination: { total, page: parseInt(page), limit: parseInt(limit), totalPages: Math.ceil(total / limit) } };
};

/**
 * Get a single booking by ID (user must own it)
 */
const getBookingById = async (bookingId, userId) => {
  const booking = await Booking.findOne({ _id: bookingId, user: userId })
    .populate('showtime', 'startTime endTime language format ticketPrice')
    .populate('movie', 'title posterUrl duration')
    .populate('theater', 'name address')
    .populate('seats', 'seatNumber row column category price');

  if (!booking) {
    const err = new Error('Booking not found.');
    err.statusCode = 404;
    throw err;
  }
  return booking;
};

/**
 * Cancel a booking
 */
const cancelBooking = async (bookingId, userId, reason) => {
  const booking = await Booking.findOne({ _id: bookingId, user: userId })
    .populate('showtime', 'startTime');

  if (!booking) {
    const err = new Error('Booking not found.');
    err.statusCode = 404;
    throw err;
  }
  if (booking.status !== 'confirmed') {
    const err = new Error('Booking is already cancelled or expired.');
    err.statusCode = 400;
    throw err;
  }

  // Check cancellation window
  const showtime = booking.showtime;
  const hoursUntilShow = (new Date(showtime.startTime) - new Date()) / (1000 * 60 * 60);
  if (hoursUntilShow < CANCELLATION_WINDOW_HOURS) {
    const err = new Error(`Cancellation not allowed within ${CANCELLATION_WINDOW_HOURS} hours of showtime.`);
    err.statusCode = 422;
    throw err;
  }

  // Update booking status
  booking.status = 'cancelled';
  booking.cancelledAt = new Date();
  booking.cancellationReason = reason || 'User requested cancellation';
  await booking.save();

  // Release seats
  await Seat.updateMany(
    { booking: booking._id },
    { $set: { status: 'available', booking: null, lockedBy: null, lockedUntil: null } }
  );

  // Restore available seats count
  await Showtime.findByIdAndUpdate(booking.showtime._id, {
    $inc: { availableSeats: booking.seatNumbers.length },
  });

  return booking;
};

module.exports = { lockSeats, confirmBooking, getUserBookings, getBookingById, cancelBooking };
