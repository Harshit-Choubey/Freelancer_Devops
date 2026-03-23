const express = require('express');
const rateLimit = require('express-rate-limit');
const { validate, registerSchema, loginSchema } = require('../middleware/validation');
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

router.post('/register', authLimiter, validate(registerSchema), register);
router.post('/verify-email', authLimiter, verifyEmail);
router.post('/login', authLimiter, validate(loginSchema), login);
router.get('/me', authenticate, getProfile);

module.exports = router;
