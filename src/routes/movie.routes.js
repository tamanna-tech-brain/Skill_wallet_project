const express = require('express');
const router = express.Router();
const movieController = require('../controllers/movie.controller');
const { authenticate } = require('../middleware/auth.middleware');
const { authorize } = require('../middleware/role.middleware');
const { validate } = require('../middleware/validate.middleware');
const { createMovieSchema, updateMovieSchema } = require('../validators/movie.validator');

// Public routes
router.get('/',             movieController.getMovies);
router.get('/now-showing',  movieController.getNowShowing);
router.get('/upcoming',     movieController.getUpcoming);
router.get('/search',       movieController.searchMovies);
router.get('/:id',          movieController.getMovieById);

// Admin routes
router.post('/',   authenticate, authorize('admin'), validate(createMovieSchema), movieController.createMovie);
router.put('/:id', authenticate, authorize('admin'), validate(updateMovieSchema), movieController.updateMovie);
router.delete('/:id', authenticate, authorize('admin'), movieController.deleteMovie);

module.exports = router;
