const express = require('express');
const router = express.Router();
// Seat status is managed via showtime and booking routes
// This file exists for potential direct seat query endpoints
const Seat = require('../models/Seat');
const { authenticate } = require('../middleware/auth.middleware');
const { success } = require('../utils/apiResponse');

// Get a specific seat's status
router.get('/:id', authenticate, async (req, res, next) => {
  try {
    const seat = await Seat.findById(req.params.id).lean();
    if (!seat) return res.status(404).json({ success: false, message: 'Seat not found' });
    return success(res, { seat }, 'Seat fetched');
  } catch (err) { next(err); }
});

module.exports = router;
