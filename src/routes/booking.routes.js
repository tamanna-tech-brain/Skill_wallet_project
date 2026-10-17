const express = require('express');
const router = express.Router();
const bookingController = require('../controllers/booking.controller');
const { authenticate } = require('../middleware/auth.middleware');
const { validate } = require('../middleware/validate.middleware');
const { lockSeatsSchema, confirmBookingSchema, cancelBookingSchema } = require('../validators/booking.validator');

// All booking routes require authentication
router.use(authenticate);

router.post('/lock-seats', validate(lockSeatsSchema),    bookingController.lockSeats);
router.post('/',           validate(confirmBookingSchema), bookingController.confirmBooking);
router.get('/',                                           bookingController.getUserBookings);
router.get('/ref/:bookingRef',                            bookingController.getBookingByRef);
router.get('/:id',                                        bookingController.getBookingById);
router.post('/:id/cancel',  validate(cancelBookingSchema), bookingController.cancelBooking);

module.exports = router;
