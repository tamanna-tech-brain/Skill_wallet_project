const Showtime = require('../models/Showtime');
const Screen = require('../models/Screen');
const Seat = require('../models/Seat');

/**
 * Check for overlapping showtimes on the same screen
 */
const checkOverlap = async (screenId, startTime, endTime, excludeId = null) => {
  const filter = {
    screen: screenId,
    status: { $nin: ['cancelled'] },
    $or: [
      { startTime: { $lt: new Date(endTime), $gte: new Date(startTime) } },
      { endTime:   { $gt: new Date(startTime), $lte: new Date(endTime) } },
      { startTime: { $lte: new Date(startTime) }, endTime: { $gte: new Date(endTime) } },
    ],
  };
  if (excludeId) filter._id = { $ne: excludeId };
  return Showtime.findOne(filter);
};

/**
 * Create seats for a showtime based on screen layout
 */
const createSeatsForShowtime = async (showtime, screen) => {
  const seats = [];
  const { seatCategories, rows, columns } = screen.layout;

  // Build a lookup of which rows belong to which category
  const rowCategoryMap = {};
  seatCategories.forEach((cat) => {
    cat.rows.forEach((row) => {
      rowCategoryMap[row] = { category: cat.category, price: cat.price };
    });
  });

  // Generate row labels (A, B, C, ...)
  const rowLabels = Array.from({ length: rows }, (_, i) => String.fromCharCode(65 + i));

  for (const row of rowLabels) {
    for (let col = 1; col <= columns; col++) {
      const seatNumber = `${row}${col}`;
      const catInfo = rowCategoryMap[row] || { category: 'Standard', price: showtime.ticketPrice.standard };
      seats.push({
        showtime: showtime._id,
        screen: screen._id,
        seatNumber,
        row,
        column: col,
        category: catInfo.category,
        price: catInfo.price || showtime.ticketPrice.standard,
        status: 'available',
      });
    }
  }

  await Seat.insertMany(seats);
  return seats.length;
};

const createShowtime = async (data) => {
  const overlap = await checkOverlap(data.screen, data.startTime, data.endTime);
  if (overlap) {
    const err = new Error('Screen already has a showtime during this period.');
    err.statusCode = 409;
    throw err;
  }

  const screen = await Screen.findById(data.screen);
  if (!screen) {
    const err = new Error('Screen not found.');
    err.statusCode = 404;
    throw err;
  }

  const showtime = await Showtime.create({
    ...data,
    theater: screen.theater,
    totalSeats: screen.totalSeats,
    availableSeats: screen.totalSeats,
  });

  await createSeatsForShowtime(showtime, screen);
  return showtime;
};

const getShowtimes = async ({ movieId, date, city, theaterId, format, page = 1, limit = 20 }) => {
  const filter = { status: 'scheduled' };
  if (movieId)   filter.movie   = movieId;
  if (theaterId) filter.theater = theaterId;
  if (format)    filter.format  = format;
  if (date) {
    const start = new Date(date);
    const end   = new Date(date);
    end.setHours(23, 59, 59, 999);
    filter.startTime = { $gte: start, $lte: end };
  }

  const skip = (parseInt(page) - 1) * parseInt(limit);
  const [showtimes, total] = await Promise.all([
    Showtime.find(filter)
      .populate('movie', 'title posterUrl duration')
      .populate('theater', 'name address')
      .populate('screen', 'screenName format')
      .sort({ startTime: 1 })
      .skip(skip)
      .limit(parseInt(limit))
      .lean(),
    Showtime.countDocuments(filter),
  ]);

  return { showtimes, pagination: { total, page: parseInt(page), limit: parseInt(limit), totalPages: Math.ceil(total / limit) } };
};

const getShowtimeById = async (id) => {
  const showtime = await Showtime.findById(id)
    .populate('movie', 'title posterUrl duration rating')
    .populate('theater', 'name address')
    .populate('screen', 'screenName format totalSeats');
  if (!showtime) {
    const err = new Error('Showtime not found.');
    err.statusCode = 404;
    throw err;
  }
  return showtime;
};

const getSeatMap = async (showtimeId) => {
  // Auto-release expired locks before returning seat map
  await Seat.updateMany(
    { showtime: showtimeId, status: 'locked', lockedUntil: { $lt: new Date() } },
    { $set: { status: 'available', lockedBy: null, lockedUntil: null } }
  );

  const seats = await Seat.find({ showtime: showtimeId })
    .select('seatNumber row column category price status')
    .sort({ row: 1, column: 1 })
    .lean();

  const available = seats.filter((s) => s.status === 'available').length;
  return { totalSeats: seats.length, availableSeats: available, seats };
};

const updateShowtime = async (id, data) => {
  if (data.startTime || data.endTime) {
    const current = await Showtime.findById(id);
    const start = data.startTime || current.startTime;
    const end   = data.endTime   || current.endTime;
    const overlap = await checkOverlap(current.screen, start, end, id);
    if (overlap) {
      const err = new Error('Screen already has a showtime during this period.');
      err.statusCode = 409;
      throw err;
    }
  }
  const showtime = await Showtime.findByIdAndUpdate(id, data, { new: true, runValidators: true });
  if (!showtime) {
    const err = new Error('Showtime not found.');
    err.statusCode = 404;
    throw err;
  }
  return showtime;
};

const deleteShowtime = async (id) => {
  const showtime = await Showtime.findByIdAndUpdate(id, { status: 'cancelled' }, { new: true });
  if (!showtime) {
    const err = new Error('Showtime not found.');
    err.statusCode = 404;
    throw err;
  }
  return showtime;
};

module.exports = { createShowtime, getShowtimes, getShowtimeById, getSeatMap, updateShowtime, deleteShowtime };
