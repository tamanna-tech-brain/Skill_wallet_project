const User = require('../models/User');
const Booking = require('../models/Booking');
const Movie = require('../models/Movie');
const Showtime = require('../models/Showtime');
const { success, error } = require('../utils/apiResponse');

exports.getDashboard = async (req, res, next) => {
  try {
    const [totalUsers, totalMovies, totalBookings, revenue] = await Promise.all([
      User.countDocuments({ role: 'user' }),
      Movie.countDocuments({ isActive: true }),
      Booking.countDocuments({ status: 'confirmed' }),
      Booking.aggregate([
        { $match: { status: 'confirmed' } },
        { $group: { _id: null, total: { $sum: '$totalAmount' } } },
      ]),
    ]);

    return success(res, {
      totalUsers,
      totalMovies,
      totalBookings,
      totalRevenue: revenue[0]?.total || 0,
    }, 'Dashboard stats');
  } catch (err) { next(err); }
};

exports.getAllBookings = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, status } = req.query;
    const filter = {};
    if (status) filter.status = status;
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const [bookings, total] = await Promise.all([
      Booking.find(filter)
        .populate('user', 'name email')
        .populate('movie', 'title')
        .populate('theater', 'name')
        .sort({ createdAt: -1 })
        .skip(skip).limit(parseInt(limit)).lean(),
      Booking.countDocuments(filter),
    ]);
    return res.status(200).json({ success: true, data: bookings, pagination: { total, page: parseInt(page), limit: parseInt(limit), totalPages: Math.ceil(total / limit) } });
  } catch (err) { next(err); }
};

exports.getRevenueReport = async (req, res, next) => {
  try {
    const { groupBy = 'movie' } = req.query;
    const groupField = groupBy === 'theater' ? '$theater' : '$movie';
    const report = await Booking.aggregate([
      { $match: { status: 'confirmed' } },
      { $group: { _id: groupField, totalRevenue: { $sum: '$totalAmount' }, totalBookings: { $sum: 1 } } },
      { $lookup: { from: groupBy === 'theater' ? 'theaters' : 'movies', localField: '_id', foreignField: '_id', as: 'details' } },
      { $unwind: { path: '$details', preserveNullAndEmpty: true } },
      { $project: { name: { $ifNull: ['$details.title', '$details.name'] }, totalRevenue: 1, totalBookings: 1 } },
      { $sort: { totalRevenue: -1 } },
    ]);
    return success(res, { report }, 'Revenue report');
  } catch (err) { next(err); }
};

exports.getOccupancyReport = async (req, res, next) => {
  try {
    const report = await Showtime.aggregate([
      { $match: { status: { $in: ['completed', 'ongoing'] } } },
      { $lookup: { from: 'movies', localField: 'movie', foreignField: '_id', as: 'movie' } },
      { $unwind: '$movie' },
      {
        $project: {
          movieTitle: '$movie.title',
          startTime: 1,
          totalSeats: 1,
          availableSeats: 1,
          bookedSeats: { $subtract: ['$totalSeats', '$availableSeats'] },
          occupancyRate: { $multiply: [{ $divide: [{ $subtract: ['$totalSeats', '$availableSeats'] }, '$totalSeats'] }, 100] },
        },
      },
      { $sort: { occupancyRate: -1 } },
    ]);
    return success(res, { report }, 'Occupancy report');
  } catch (err) { next(err); }
};

exports.getAllUsers = async (req, res, next) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const [users, total] = await Promise.all([
      User.find().select('-password').skip(skip).limit(parseInt(limit)).lean(),
      User.countDocuments(),
    ]);
    return res.status(200).json({ success: true, data: users, pagination: { total, page: parseInt(page), limit: parseInt(limit), totalPages: Math.ceil(total / limit) } });
  } catch (err) { next(err); }
};

exports.toggleUserBan = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return error(res, 'User not found', 404);
    user.isActive = !user.isActive;
    await user.save({ validateBeforeSave: false });
    return success(res, { user }, `User ${user.isActive ? 'unbanned' : 'banned'} successfully`);
  } catch (err) { next(err); }
};
