const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const User = require('../models/User');

/**
 * Generate a signed JWT for a user
 */
const generateToken = (user) => {
  return jwt.sign(
    { sub: user._id, name: user.name, email: user.email, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  );
};

/**
 * Register a new user
 */
const register = async ({ name, email, password, phone }) => {
  const existing = await User.findOne({ email });
  if (existing) {
    const err = new Error('Email already registered.');
    err.statusCode = 409;
    throw err;
  }
  const user = await User.create({ name, email, password, phone });
  const token = generateToken(user);
  return { token, user };
};

/**
 * Login a user
 */
const login = async ({ email, password }) => {
  const cleanEmail = (email || '').trim().toLowerCase();
  const cleanPassword = (password || '').trim();
  const user = await User.findOne({ email: cleanEmail }).select('+password');
  if (!user || !user.isActive) {
    const err = new Error('Invalid email or password.');
    err.statusCode = 401;
    throw err;
  }
  const isMatch = await user.comparePassword(cleanPassword);
  if (!isMatch) {
    const err = new Error('Invalid email or password.');
    err.statusCode = 401;
    throw err;
  }
  user.lastLogin = new Date();
  await user.save({ validateBeforeSave: false });
  const token = generateToken(user);
  return { token, user };
};

/**
 * Update user profile
 */
const updateProfile = async (userId, { name, phone }) => {
  const user = await User.findByIdAndUpdate(
    userId,
    { name, phone },
    { new: true, runValidators: true }
  );
  return user;
};

/**
 * Change user password
 */
const changePassword = async (userId, { currentPassword, newPassword }) => {
  const user = await User.findById(userId).select('+password');
  const isMatch = await user.comparePassword(currentPassword);
  if (!isMatch) {
    const err = new Error('Current password is incorrect.');
    err.statusCode = 400;
    throw err;
  }
  user.password = newPassword;
  await user.save();
  return true;
};

/**
 * Generate password reset token
 */
const generateResetToken = async (email) => {
  const user = await User.findOne({ email });
  if (!user) {
    // Don't reveal if email exists
    return null;
  }
  const token = crypto.randomBytes(32).toString('hex');
  user.passwordResetToken = crypto.createHash('sha256').update(token).digest('hex');
  user.passwordResetExpires = Date.now() + 60 * 60 * 1000; // 1 hour
  await user.save({ validateBeforeSave: false });
  return { token, user };
};

/**
 * Reset password using token
 */
const resetPassword = async (token, newPassword) => {
  const hashedToken = crypto.createHash('sha256').update(token).digest('hex');
  const user = await User.findOne({
    passwordResetToken: hashedToken,
    passwordResetExpires: { $gt: Date.now() },
  });
  if (!user) {
    const err = new Error('Token is invalid or has expired.');
    err.statusCode = 400;
    throw err;
  }
  user.password = newPassword;
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;
  await user.save();
  return true;
};

module.exports = { generateToken, register, login, updateProfile, changePassword, generateResetToken, resetPassword };
