const Joi = require('joi');

const createMovieSchema = Joi.object({
  title: Joi.string().required(),
  description: Joi.string().required(),
  genre: Joi.array().items(Joi.string()).optional(),
  language: Joi.array().items(Joi.string()).optional(),
  duration: Joi.number().integer().min(1).required(),
  releaseDate: Joi.date().required(),
  director: Joi.string().optional(),
  cast: Joi.array().items(Joi.object({ name: Joi.string(), role: Joi.string() })).optional(),
  posterUrl: Joi.string().uri().optional(),
  trailerUrl: Joi.string().uri().optional(),
  rating: Joi.object({
    imdb: Joi.number().min(0).max(10).optional(),
    internal: Joi.number().min(0).max(5).optional(),
  }).optional(),
  format: Joi.array().items(Joi.string().valid('2D', '3D', 'IMAX', '4DX')).optional(),
  status: Joi.string().valid('now_showing', 'upcoming', 'expired').optional(),
});

const updateMovieSchema = createMovieSchema.fork(
  ['title', 'description', 'duration', 'releaseDate'],
  (field) => field.optional()
);

module.exports = { createMovieSchema, updateMovieSchema };
