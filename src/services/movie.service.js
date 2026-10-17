const Movie = require('../models/Movie');

const getMovies = async ({ page = 1, limit = 10, genre, language, status, sortBy = 'createdAt', q }) => {
  const filter = { isActive: true };
  if (genre)    filter.genre    = { $in: [genre] };
  if (language) filter.language = { $in: [language] };
  if (status)   filter.status   = status;
  if (q)        filter.$text    = { $search: q };

  const sort = sortBy === 'rating' ? { 'rating.imdb': -1 } : { [sortBy]: -1 };
  const skip = (parseInt(page) - 1) * parseInt(limit);

  const [movies, total] = await Promise.all([
    Movie.find(filter).sort(sort).skip(skip).limit(parseInt(limit)).lean(),
    Movie.countDocuments(filter),
  ]);

  return {
    movies,
    pagination: { total, page: parseInt(page), limit: parseInt(limit), totalPages: Math.ceil(total / limit) },
  };
};

const getMovieById = async (id) => {
  const movie = await Movie.findById(id);
  if (!movie || !movie.isActive) {
    const err = new Error('Movie not found.');
    err.statusCode = 404;
    throw err;
  }
  return movie;
};

const createMovie = async (data) => {
  return Movie.create(data);
};

const updateMovie = async (id, data) => {
  const movie = await Movie.findByIdAndUpdate(id, data, { new: true, runValidators: true });
  if (!movie) {
    const err = new Error('Movie not found.');
    err.statusCode = 404;
    throw err;
  }
  return movie;
};

const deleteMovie = async (id) => {
  const movie = await Movie.findByIdAndUpdate(id, { isActive: false }, { new: true });
  if (!movie) {
    const err = new Error('Movie not found.');
    err.statusCode = 404;
    throw err;
  }
  return movie;
};

module.exports = { getMovies, getMovieById, createMovie, updateMovie, deleteMovie };
