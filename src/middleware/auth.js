const jwt = require('jsonwebtoken');
const { AppError } = require('../utils/errors');
const userRepository = require('../repositories/userRepository');
const logger = require('../utils/logger');
const env = require('../config/env');

/**
 * Authenticate — validates JWT and attaches user to req.
 * Fully decoupled from Prisma; uses the Repository layer.
 */
const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return next(new AppError('Access token is required', 401));
    }

    const token = authHeader.substring(7);

    let decoded;
    try {
      decoded = jwt.verify(token, env.JWT_SECRET);
    } catch (jwtError) {
      if (jwtError.name === 'TokenExpiredError') {
        return next(new AppError('Your session has expired. Please log in again.', 401));
      }
      return next(new AppError('Invalid token. Please log in again.', 401));
    }

    const user = await userRepository.findById(decoded.userId);

    if (!user) {
      return next(new AppError('User no longer exists', 401));
    }

    if (!user.isVerified) {
      return next(new AppError('Please verify your email first', 403));
    }

    logger.auth('Request authenticated', { userId: user.id, method: req.method, url: req.originalUrl });

    req.user = user;
    next();
  } catch (error) {
    logger.sysError('Authentication middleware error', error);
    next(new AppError('Authentication failed', 401));
  }
};

/**
 * Authorize — role-based access control guard.
 * Usage: router.get('/admin', authenticate, authorize('ADMIN'), handler)
 */
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return next(new AppError('Not authenticated', 401));
    }
    if (!roles.includes(req.user.role)) {
      logger.auth('Authorization denied', { userId: req.user.id, requiredRoles: roles, userRole: req.user.role });
      return next(new AppError(`Access denied. Required role: ${roles.join(' or ')}`, 403));
    }
    next();
  };
};

module.exports = { authenticate, authorize };
