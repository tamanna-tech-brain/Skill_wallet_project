const authService = require('../services/auth.service');
const emailService = require('../services/email.service');
const { success, created, error } = require('../utils/apiResponse');

exports.register = async (req, res, next) => {
  try {
    const { token, user } = await authService.register(req.body);
    return created(res, { token, user }, 'Registration successful');
  } catch (err) { next(err); }
};

exports.login = async (req, res, next) => {
  try {
    const { token, user } = await authService.login(req.body);
    return success(res, { token, user }, 'Login successful');
  } catch (err) { next(err); }
};

exports.getMe = async (req, res) => {
  return success(res, { user: req.user }, 'Profile fetched');
};

exports.updateProfile = async (req, res, next) => {
  try {
    const user = await authService.updateProfile(req.user._id, req.body);
    return success(res, { user }, 'Profile updated');
  } catch (err) { next(err); }
};

exports.changePassword = async (req, res, next) => {
  try {
    await authService.changePassword(req.user._id, req.body);
    return success(res, null, 'Password changed successfully');
  } catch (err) { next(err); }
};

exports.forgotPassword = async (req, res, next) => {
  try {
    const result = await authService.generateResetToken(req.body.email);
    if (result) {
      const resetUrl = `${process.env.APP_URL}/api/v1/auth/reset-password?token=${result.token}`;
      await emailService.sendPasswordReset(result.user.email, result.user.name, resetUrl);
    }
    // Always return success to prevent email enumeration
    return success(res, null, 'If that email is registered, a reset link has been sent.');
  } catch (err) { next(err); }
};

exports.resetPassword = async (req, res, next) => {
  try {
    await authService.resetPassword(req.body.token, req.body.newPassword);
    return success(res, null, 'Password reset successful. Please login.');
  } catch (err) { next(err); }
};
