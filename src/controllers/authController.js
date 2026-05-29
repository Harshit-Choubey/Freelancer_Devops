const authService = require('../services/authService');
const catchAsync = require('../utils/catchAsync');
const userRepository = require('../repositories/userRepository');
const logger = require('../utils/logger');

// ─── Register ────────────────────────────────────────────────────────────────
const register = catchAsync(async (req, res) => {
  const user = await authService.register(req.body);

  logger.auth('New user registered', { userId: user.id, role: user.role });

  res.status(201).json({
    success: true,
    message: 'Registration successful. Please check your email for your verification code.',
    data: { user },
  });
});

// ─── Verify Email ─────────────────────────────────────────────────────────────
const verifyEmail = catchAsync(async (req, res) => {
  const { email, otp } = req.body;
  await authService.verifyEmail(email, otp);

  logger.auth('Email verified', { email });

  res.json({
    success: true,
    message: 'Email verified successfully. You can now log in.',
    data: null,
  });
});

// ─── Login ────────────────────────────────────────────────────────────────────
const login = catchAsync(async (req, res) => {
  const { email, password } = req.body;
  const { user, token } = await authService.login(email, password);

  logger.auth('User logged in', { userId: user.id, role: user.role });

  res.json({
    success: true,
    message: 'Login successful',
    data: { user, token },
  });
});

// ─── Get Profile ──────────────────────────────────────────────────────────────
const getProfile = catchAsync(async (req, res) => {
  const user = await userRepository.findById(req.user.id);
  const { password, ...userWithoutPassword } = user;

  res.json({
    success: true,
    message: 'Profile retrieved successfully',
    data: { user: userWithoutPassword },
  });
});

module.exports = { register, verifyEmail, login, getProfile };
