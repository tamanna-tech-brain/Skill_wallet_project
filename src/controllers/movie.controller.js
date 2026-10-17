const movieService = require('../services/movie.service');
const { success, created, paginated } = require('../utils/apiResponse');

exports.getMovies = async (req, res, next) => {
  try {
    const result = await movieService.getMovies(req.query);
    return paginated(res, result.movies, result.pagination, 'Movies fetched');
  } catch (err) { next(err); }
};

exports.getNowShowing = async (req, res, next) => {
  try {
    const result = await movieService.getMovies({ ...req.query, status: 'now_showing' });
    return paginated(res, result.movies, result.pagination, 'Now showing movies');
  } catch (err) { next(err); }
};

exports.getUpcoming = async (req, res, next) => {
  try {
    const result = await movieService.getMovies({ ...req.query, status: 'upcoming' });
    return paginated(res, result.movies, result.pagination, 'Upcoming movies');
  } catch (err) { next(err); }
};

exports.searchMovies = async (req, res, next) => {
  try {
    const result = await movieService.getMovies({ ...req.query, q: req.query.q });
    return paginated(res, result.movies, result.pagination, 'Search results');
  } catch (err) { next(err); }
};

exports.getMovieById = async (req, res, next) => {
  try {
    const movie = await movieService.getMovieById(req.params.id);
    return success(res, { movie }, 'Movie fetched');
  } catch (err) { next(err); }
};

exports.createMovie = async (req, res, next) => {
  try {
    const movie = await movieService.createMovie(req.body);
    return created(res, { movie }, 'Movie created');
  } catch (err) { next(err); }
};

exports.updateMovie = async (req, res, next) => {
  try {
    const movie = await movieService.updateMovie(req.params.id, req.body);
    return success(res, { movie }, 'Movie updated');
  } catch (err) { next(err); }
};

exports.deleteMovie = async (req, res, next) => {
  try {
    await movieService.deleteMovie(req.params.id);
    return success(res, null, 'Movie deleted');
  } catch (err) { next(err); }
};
