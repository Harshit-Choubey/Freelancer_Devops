const express = require('express');
const { authenticate, authorize } = require('../middleware/auth');
const { validate } = require('../middleware/validation');
const jobValidator = require('../validators/jobValidator');
const {
  createJob,
  getAllJobs,
  getJobById,
  updateJob,
  deleteJob,
  applyToJob,
  getMyJobs,
  getMyApplications,
  getJobApplications,
  updateApplicationStatus,
} = require('../controllers/jobController');

const router = express.Router();

// Public routes
router.get('/', getAllJobs);

// Protected routes
router.use(authenticate);

// Authenticated job browsing (for freelancers to see application status)
router.get('/browse', getAllJobs);

// User-specific routes (must come before generic :id routes)
router.get('/my/jobs', authorize('CLIENT'), getMyJobs);
router.get('/my/applications', authorize('FREELANCER'), getMyApplications);

// Client-only routes
router.post('/', authorize('CLIENT'), validate(jobValidator.create), createJob);
router.get('/:id/applications', authorize('CLIENT'), getJobApplications);
router.put('/applications/:id/status', authorize('CLIENT'), validate(jobValidator.updateApplicationStatus), updateApplicationStatus);
router.put('/:id', authorize('CLIENT'), validate(jobValidator.update), updateJob);
router.delete('/:id', authorize('CLIENT'), deleteJob);

// Freelancer-only routes
router.post('/:id/apply', authorize('FREELANCER'), validate(jobValidator.apply), applyToJob);

// Public route (must be last to avoid conflicts)
router.get('/:id', getJobById);

module.exports = router;