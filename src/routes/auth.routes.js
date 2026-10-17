const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller');
const { validate } = require('../middleware/validate.middleware');
const { authenticate } = require('../middleware/auth.middleware');
const { authLimiter } = require('../middleware/rateLimiter');
const {
  registerSchema, loginSchema, updateProfileSchema,
  changePasswordSchema, forgotPasswordSchema, resetPasswordSchema,
} = require('../validators/auth.validator');

router.post('/register',        authLimiter, validate(registerSchema),        authController.register);
router.post('/login',           authLimiter, validate(loginSchema),           authController.login);
router.post('/forgot-password', authLimiter, validate(forgotPasswordSchema),  authController.forgotPassword);
router.post('/reset-password',               validate(resetPasswordSchema),   authController.resetPassword);

router.get( '/me',               authenticate,                                           authController.getMe);
router.put( '/profile',          authenticate, validate(updateProfileSchema),            authController.updateProfile);
router.post('/change-password',  authenticate, validate(changePasswordSchema),           authController.changePassword);

module.exports = router;
