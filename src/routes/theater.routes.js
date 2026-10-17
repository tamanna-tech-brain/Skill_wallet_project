const express = require('express');
const router = express.Router();
const theaterController = require('../controllers/theater.controller');
const { authenticate } = require('../middleware/auth.middleware');
const { authorize } = require('../middleware/role.middleware');

// Theater routes
router.get('/',    theaterController.getTheaters);
router.get('/:id', theaterController.getTheaterById);
router.post('/',   authenticate, authorize('admin'), theaterController.createTheater);
router.put('/:id', authenticate, authorize('admin'), theaterController.updateTheater);
router.delete('/:id', authenticate, authorize('admin'), theaterController.deleteTheater);

// Screen routes nested under theaters
router.get( '/:id/screens',                   theaterController.getScreensByTheater);
router.post('/:id/screens', authenticate, authorize('admin'), theaterController.createScreen);
router.put( '/:id/screens/:screenId', authenticate, authorize('admin'), theaterController.updateScreen);
router.delete('/:id/screens/:screenId', authenticate, authorize('admin'), theaterController.deleteScreen);

module.exports = router;
