const Theater = require('../models/Theater');
const Screen = require('../models/Screen');
const { success, created, paginated, error } = require('../utils/apiResponse');

// ─── Theater Controllers ──────────────────────────────────────────────────────

exports.getTheaters = async (req, res, next) => {
  try {
    const { city, page = 1, limit = 20 } = req.query;
    const filter = { isActive: true };
    if (city) filter['address.city'] = new RegExp(city, 'i');

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const [theaters, total] = await Promise.all([
      Theater.find(filter).skip(skip).limit(parseInt(limit)).lean(),
      Theater.countDocuments(filter),
    ]);
    return paginated(res, theaters, { total, page: parseInt(page), limit: parseInt(limit), totalPages: Math.ceil(total / limit) });
  } catch (err) { next(err); }
};

exports.getTheaterById = async (req, res, next) => {
  try {
    const theater = await Theater.findById(req.params.id);
    if (!theater) return error(res, 'Theater not found', 404);
    return success(res, { theater }, 'Theater fetched');
  } catch (err) { next(err); }
};

exports.createTheater = async (req, res, next) => {
  try {
    const theater = await Theater.create(req.body);
    return created(res, { theater }, 'Theater created');
  } catch (err) { next(err); }
};

exports.updateTheater = async (req, res, next) => {
  try {
    const theater = await Theater.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!theater) return error(res, 'Theater not found', 404);
    return success(res, { theater }, 'Theater updated');
  } catch (err) { next(err); }
};

exports.deleteTheater = async (req, res, next) => {
  try {
    const theater = await Theater.findByIdAndUpdate(req.params.id, { isActive: false }, { new: true });
    if (!theater) return error(res, 'Theater not found', 404);
    return success(res, null, 'Theater deleted');
  } catch (err) { next(err); }
};

// ─── Screen Controllers ───────────────────────────────────────────────────────

exports.getScreensByTheater = async (req, res, next) => {
  try {
    const screens = await Screen.find({ theater: req.params.id, isActive: true }).lean();
    return success(res, { screens }, 'Screens fetched');
  } catch (err) { next(err); }
};

exports.createScreen = async (req, res, next) => {
  try {
    const screen = await Screen.create({ ...req.body, theater: req.params.id });
    return created(res, { screen }, 'Screen created');
  } catch (err) { next(err); }
};

exports.updateScreen = async (req, res, next) => {
  try {
    const screen = await Screen.findByIdAndUpdate(req.params.screenId, req.body, { new: true });
    if (!screen) return error(res, 'Screen not found', 404);
    return success(res, { screen }, 'Screen updated');
  } catch (err) { next(err); }
};

exports.deleteScreen = async (req, res, next) => {
  try {
    const screen = await Screen.findByIdAndUpdate(req.params.screenId, { isActive: false }, { new: true });
    if (!screen) return error(res, 'Screen not found', 404);
    return success(res, null, 'Screen deleted');
  } catch (err) { next(err); }
};
