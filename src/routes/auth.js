const express = require('express');
const rateLimit = require('express-rate-limit');
const { validate } = require('../middleware/validation');
const authValidator = require('../validators/authValidator');
const { authenticate } = require('../middleware/auth');
const {
  register,
  verifyEmail,
  login,
  getProfile,
} = require('../controllers/authController');

const router = express.Router();

// Rate limiting for auth endpoints
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 attempts per window
  message: {
    success: false,
    error: { message: 'Too many attempts, please try again later' },
  },
});

router.post('/register', authLimiter, validate(authValidator.register), register);
router.post('/verify-email', authLimiter, validate(authValidator.verifyEmail), verifyEmail);
router.post('/login', authLimiter, validate(authValidator.login), login);
router.get('/me', authenticate, getProfile);

module.exports = router;
