const userService = require('../services/userService');
const catchAsync = require('../utils/catchAsync');
const logger = require('../utils/logger');

// ─── Update Profile ────────────────────────────────────────────────────────────
const updateProfile = catchAsync(async (req, res) => {
  const user = await userService.updateProfile(req.user.id, req.body);

  res.json({
    success: true,
    message: 'Profile updated successfully',
    data: { user },
  });
});

// ─── Change Password ───────────────────────────────────────────────────────────
const changePassword = catchAsync(async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  await userService.changePassword(req.user.id, currentPassword, newPassword);

  res.json({
    success: true,
    message: 'Password changed successfully',
    data: null,
  });
});

// ─── Get Freelancers ───────────────────────────────────────────────────────────
const getFreelancers = catchAsync(async (req, res) => {
  const result = await userService.getFreelancers(req.query);

  res.json({
    success: true,
    message: 'Freelancers retrieved successfully',
    data: result,
  });
});

// ─── Get Freelancer By ID ──────────────────────────────────────────────────────
const getFreelancerById = catchAsync(async (req, res) => {
  const freelancer = await userService.getFreelancerById(req.params.id);

  res.json({
    success: true,
    message: 'Freelancer retrieved successfully',
    data: { freelancer },
  });
});

// ─── Upload Profile Picture ────────────────────────────────────────────────────
const uploadProfilePicture = catchAsync(async (req, res) => {
  const user = await userService.uploadProfilePicture(req.user.id, req.file);

  res.json({
    success: true,
    message: 'Profile picture updated successfully',
    data: { profilePicture: user.profilePicture },
  });
});

// ─── Dashboard Stats ───────────────────────────────────────────────────────────
const getDashboardStats = catchAsync(async (req, res) => {
  const stats = await userService.getDashboardStats(req.user.id, req.user.role);

  res.json({
    success: true,
    message: 'Dashboard stats retrieved successfully',
    data: { stats },
  });
});

module.exports = {
  updateProfile,
  changePassword,
  getFreelancers,
  getFreelancerById,
  uploadProfilePicture,
  getDashboardStats,
};