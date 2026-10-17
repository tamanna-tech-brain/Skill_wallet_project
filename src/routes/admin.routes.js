const express = require('express');
const router = express.Router();
const adminController = require('../controllers/admin.controller');
const { authenticate } = require('../middleware/auth.middleware');
const { authorize } = require('../middleware/role.middleware');

// All admin routes — must be authenticated AND have 'admin' role
router.use(authenticate, authorize('admin'));

router.get('/dashboard',           adminController.getDashboard);
router.get('/bookings',            adminController.getAllBookings);
router.get('/reports/revenue',     adminController.getRevenueReport);
router.get('/reports/occupancy',   adminController.getOccupancyReport);
router.get('/users',               adminController.getAllUsers);
router.put('/users/:id/ban',       adminController.toggleUserBan);

module.exports = router;
