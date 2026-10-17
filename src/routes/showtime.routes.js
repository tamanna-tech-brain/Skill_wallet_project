const express = require('express');
const router = express.Router();
const showtimeController = require('../controllers/showtime.controller');
const { authenticate } = require('../middleware/auth.middleware');
const { authorize } = require('../middleware/role.middleware');

// Public routes
router.get('/',         showtimeController.getShowtimes);
router.get('/:id',      showtimeController.getShowtimeById);
router.get('/:id/seats', showtimeController.getSeatMap);

// Admin routes
router.post('/',    authenticate, authorize('admin'), showtimeController.createShowtime);
router.put('/:id',  authenticate, authorize('admin'), showtimeController.updateShowtime);
router.delete('/:id', authenticate, authorize('admin'), showtimeController.deleteShowtime);

module.exports = router;
