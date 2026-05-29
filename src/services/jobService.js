const jobRepository = require('../repositories/jobRepository');
const { AppError, NotFoundError, ForbiddenError, BadRequestError } = require('../utils/errors');

class JobService {
  async createJob(jobData, clientId) {
    return await jobRepository.create({ ...jobData, clientId });
  }

  async getAllJobs(query, userId) {
    const { page = 1, limit = 10, category, skills, minBudget, maxBudget, search } = query;
    const skip = (page - 1) * limit;

    const where = {
      status: 'OPEN',
      ...(category && { category }),
      ...(skills && { requiredSkills: { hasSome: skills.split(',') } }),
      ...(minBudget && { budget: { gte: parseFloat(minBudget) } }),
      ...(maxBudget && { budget: { lte: parseFloat(maxBudget) } }),
      ...(search && {
        OR: [
          { title: { contains: search, mode: 'insensitive' } },
          { description: { contains: search, mode: 'insensitive' } },
        ],
      }),
    };

    const [jobs, total] = await Promise.all([
      jobRepository.findMany(where, parseInt(skip), parseInt(limit)),
      jobRepository.count(where),
    ]);

    let jobsWithApplicationStatus = jobs;
    if (userId) {
      const myApplications = await jobRepository.findMyApplications(userId);
      const appliedJobIds = new Set(myApplications.map((app) => app.job.id));

      jobsWithApplicationStatus = jobs.map((job) => ({
        ...job,
        hasApplied: appliedJobIds.has(job.id),
      }));
    }

    return {
      jobs: jobsWithApplicationStatus,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit),
      },
    };
  }

  async getJobById(id) {
    const job = await jobRepository.findById(id);
    if (!job) {
      throw new NotFoundError('Job not found');
    }
    return job;
  }

  async updateJob(id, updateData, clientId) {
    const existingJob = await jobRepository.findById(id);
    if (!existingJob) {
      throw new NotFoundError('Job not found');
    }
    if (existingJob.clientId !== clientId) {
      throw new ForbiddenError('Not authorized to update this job');
    }

    return await jobRepository.update(id, updateData);
  }

  async deleteJob(id, clientId) {
    const existingJob = await jobRepository.findById(id);
    if (!existingJob) {
      throw new NotFoundError('Job not found');
    }
    if (existingJob.clientId !== clientId) {
      throw new ForbiddenError('Not authorized to delete this job');
    }

    await jobRepository.delete(id);
    return true;
  }

  async applyToJob(id, applicationData, freelancerId) {
    const job = await jobRepository.findById(id);
    if (!job) {
      throw new NotFoundError('Job not found');
    }
    if (job.status !== 'OPEN') {
      throw new BadRequestError('Job is no longer accepting applications');
    }
    if (job.clientId === freelancerId) {
      throw new BadRequestError('Cannot apply to your own job');
    }

    const existingApplication = await jobRepository.checkExistingApplication(id, freelancerId);
    if (existingApplication) {
      throw new BadRequestError('You have already applied to this job');
    }

    return await jobRepository.createApplication({
      ...applicationData,
      jobId: id,
      freelancerId,
    });
  }

  async getMyJobs(clientId, status) {
    return await jobRepository.findMyJobs(clientId, status);
  }

  async getMyApplications(freelancerId, status) {
    return await jobRepository.findMyApplications(freelancerId, status);
  }

  async getJobApplications(id, clientId) {
    const job = await jobRepository.findById(id);
    if (!job) {
      throw new NotFoundError('Job not found');
    }
    if (job.clientId !== clientId) {
      throw new ForbiddenError('Not authorized to view applications for this job');
    }

    const applications = await jobRepository.findJobApplications(id);
    return { job: { id, title: job.title }, applications };
  }

  async updateApplicationStatus(id, status, clientId) {
    const application = await jobRepository.findApplicationById(id);
    if (!application) {
      throw new NotFoundError('Application not found');
    }
    if (application.job.clientId !== clientId) {
      throw new ForbiddenError('Not authorized to update this application');
    }

    const updatedApplication = await jobRepository.updateApplicationStatus(id, status);

    if (status === 'ACCEPTED') {
      await jobRepository.update(application.jobId || application.job.id, { status: 'IN_PROGRESS' });
    }

    return updatedApplication;
  }
}

module.exports = new JobService();
