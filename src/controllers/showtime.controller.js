const showtimeService = require('../services/showtime.service');
const { success, created, paginated } = require('../utils/apiResponse');

exports.getShowtimes = async (req, res, next) => {
  try {
    const result = await showtimeService.getShowtimes(req.query);
    return paginated(res, result.showtimes, result.pagination, 'Showtimes fetched');
  } catch (err) { next(err); }
};

exports.getShowtimeById = async (req, res, next) => {
  try {
    const showtime = await showtimeService.getShowtimeById(req.params.id);
    return success(res, { showtime }, 'Showtime fetched');
  } catch (err) { next(err); }
};

exports.getSeatMap = async (req, res, next) => {
  try {
    const data = await showtimeService.getSeatMap(req.params.id);
    return success(res, data, 'Seat map fetched');
  } catch (err) { next(err); }
};

exports.createShowtime = async (req, res, next) => {
  try {
    const showtime = await showtimeService.createShowtime(req.body);
    return created(res, { showtime }, 'Showtime created');
  } catch (err) { next(err); }
};

exports.updateShowtime = async (req, res, next) => {
  try {
    const showtime = await showtimeService.updateShowtime(req.params.id, req.body);
    return success(res, { showtime }, 'Showtime updated');
  } catch (err) { next(err); }
};

exports.deleteShowtime = async (req, res, next) => {
  try {
    await showtimeService.deleteShowtime(req.params.id);
    return success(res, null, 'Showtime cancelled');
  } catch (err) { next(err); }
};
