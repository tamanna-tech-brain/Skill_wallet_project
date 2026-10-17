module.exports = {
  SEAT_STATUS: {
    AVAILABLE: 'available',
    LOCKED: 'locked',
    BOOKED: 'booked',
  },
  BOOKING_STATUS: {
    CONFIRMED: 'confirmed',
    CANCELLED: 'cancelled',
    EXPIRED: 'expired',
  },
  MOVIE_STATUS: {
    NOW_SHOWING: 'now_showing',
    UPCOMING: 'upcoming',
    EXPIRED: 'expired',
  },
  SHOWTIME_STATUS: {
    SCHEDULED: 'scheduled',
    ONGOING: 'ongoing',
    COMPLETED: 'completed',
    CANCELLED: 'cancelled',
  },
  USER_ROLES: {
    USER: 'user',
    ADMIN: 'admin',
  },
  SEAT_LOCK_DURATION_MS: parseInt(process.env.SEAT_LOCK_DURATION_MS) || 600000,
  MAX_SEATS_PER_BOOKING: 10,
  CANCELLATION_WINDOW_HOURS: 2,
};
