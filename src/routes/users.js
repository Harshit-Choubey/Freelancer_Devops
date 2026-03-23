const express = require('express');
const { authenticate, authorize } = require('../middleware/auth');
const uploadService = require('../services/uploadService');
const {
  updateProfile,
  changePassword,
  getFreelancers,
  getFreelancerById,
  uploadProfilePicture,
  getDashboardStats,
} = require('../controllers/userController');

const router = express.Router();

// Public routes
router.get('/freelancers', getFreelancers);
router.get('/freelancers/:id', getFreelancerById);

// Protected routes
router.use(authenticate);

router.put('/profile', updateProfile);
router.put('/password', changePassword);
router.get('/dashboard/stats', getDashboardStats);

// File upload route
router.post(
  '/profile/picture',
  uploadService.createUploadMiddleware('profilePicture'),
  uploadProfilePicture
);

module.exports = router;