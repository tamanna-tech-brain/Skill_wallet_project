const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { error } = require('../utils/apiResponse');

const authenticate = async (req, res, next) => {
  try {
    let token;
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.split(' ')[1];
    } else if (req.cookies && req.cookies.token) {
      token = req.cookies.token;
    } else if (req.headers['x-auth-token']) {
      token = req.headers['x-auth-token'];
    }

    if (!token) {
      return error(res, 'Access denied. No token provided.', 401);
    }
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await User.findById(decoded.sub).select('-password');
    if (!user || !user.isActive) {
      return error(res, 'User not found or account deactivated.', 401);
    }

    req.user = user;
    next();
  } catch (err) {
    if (err.name === 'JsonWebTokenError') return error(res, 'Invalid token.', 401);
    if (err.name === 'TokenExpiredError') return error(res, 'Token has expired.', 401);
    next(err);
  }
};

module.exports = { authenticate };
