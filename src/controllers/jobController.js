const jobService = require('../services/jobService');
const catchAsync = require('../utils/catchAsync');
const logger = require('../utils/logger');

// ─── Create Job ───────────────────────────────────────────────────────────────
const createJob = catchAsync(async (req, res) => {
  const job = await jobService.createJob(req.body, req.user.id);
  logger.job('Job created', { jobId: job.id, clientId: req.user.id });
  res.status(201).json({
    success: true,
    message: 'Job created successfully',
    data: { job },
  });
});

// ─── Get All Jobs ─────────────────────────────────────────────────────────────
const getAllJobs = catchAsync(async (req, res) => {
  const result = await jobService.getAllJobs(req.query, req.user?.id);
  res.json({
    success: true,
    message: 'Jobs retrieved successfully',
    data: result,
  });
});

// ─── Get Job By ID ────────────────────────────────────────────────────────────
const getJobById = catchAsync(async (req, res) => {
  const job = await jobService.getJobById(req.params.id);
  res.json({
    success: true,
    message: 'Job retrieved successfully',
    data: { job },
  });
});

// ─── Update Job ───────────────────────────────────────────────────────────────
const updateJob = catchAsync(async (req, res) => {
  const job = await jobService.updateJob(req.params.id, req.body, req.user.id);
  logger.job('Job updated', { jobId: req.params.id, clientId: req.user.id });
  res.json({
    success: true,
    message: 'Job updated successfully',
    data: { job },
  });
});

// ─── Delete Job ───────────────────────────────────────────────────────────────
const deleteJob = catchAsync(async (req, res) => {
  await jobService.deleteJob(req.params.id, req.user.id);
  logger.job('Job deleted', { jobId: req.params.id, clientId: req.user.id });
  res.json({
    success: true,
    message: 'Job deleted successfully',
    data: null,
  });
});

// ─── Apply to Job ─────────────────────────────────────────────────────────────
const applyToJob = catchAsync(async (req, res) => {
  const application = await jobService.applyToJob(req.params.id, req.body, req.user.id);
  logger.job('Application submitted', { jobId: req.params.id, freelancerId: req.user.id });
  res.status(201).json({
    success: true,
    message: 'Application submitted successfully',
    data: { application },
  });
});

// ─── Get My Jobs (Client) ─────────────────────────────────────────────────────
const getMyJobs = catchAsync(async (req, res) => {
  const jobs = await jobService.getMyJobs(req.user.id, req.query.status);
  res.json({
    success: true,
    message: 'Your jobs retrieved successfully',
    data: { jobs },
  });
});

// ─── Get My Applications (Freelancer) ────────────────────────────────────────
const getMyApplications = catchAsync(async (req, res) => {
  const applications = await jobService.getMyApplications(req.user.id, req.query.status);
  res.json({
    success: true,
    message: 'Your applications retrieved successfully',
    data: { applications },
  });
});

// ─── Get Job Applications (Client view) ──────────────────────────────────────
const getJobApplications = catchAsync(async (req, res) => {
  const result = await jobService.getJobApplications(req.params.id, req.user.id);
  res.json({
    success: true,
    message: 'Applications retrieved successfully',
    data: result,
  });
});

// ─── Update Application Status ────────────────────────────────────────────────
const updateApplicationStatus = catchAsync(async (req, res) => {
  const application = await jobService.updateApplicationStatus(
    req.params.id, req.body.status, req.user.id
  );
  logger.job('Application status updated', {
    applicationId: req.params.id,
    status: req.body.status,
    clientId: req.user.id,
  });
  res.json({
    success: true,
    message: `Application ${req.body.status.toLowerCase()} successfully`,
    data: { application },
  });
});

module.exports = {
  createJob, getAllJobs, getJobById,
  updateJob, deleteJob, applyToJob,
  getMyJobs, getMyApplications,
  getJobApplications, updateApplicationStatus,
};