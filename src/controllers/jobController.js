const { PrismaClient } = require('@prisma/client');
const { AppError } = require('../utils/helpers');

const prisma = new PrismaClient();

const createJob = async (req, res, next) => {
  try {
    const { title, description, budget, requiredSkills, category } = req.body;
    const clientId = req.user.id;

    const job = await prisma.job.create({
      data: {
        title,
        description,
        budget,
        requiredSkills,
        category,
        clientId,
      },
      include: {
        client: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
    });

    res.status(201).json({
      success: true,
      message: 'Job created successfully',
      job,
    });
  } catch (error) {
    next(error);
  }
};

const getAllJobs = async (req, res, next) => {
  try {
    const { page = 1, limit = 10, category, skills, minBudget, maxBudget, search } = req.query;
    const skip = (page - 1) * limit;
    const userId = req.user?.id;

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
      prisma.job.findMany({
        where,
        skip: parseInt(skip),
        take: parseInt(limit),
        orderBy: { createdAt: 'desc' },
        include: {
          client: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
            },
          },
          _count: {
            select: { applications: true },
          },
          ...(userId && {
            applications: {
              where: { freelancerId: userId },
              select: { id: true },
            }
          }),
        },
      }),
      prisma.job.count({ where }),
    ]);

    // Add hasApplied flag to each job
    const jobsWithApplicationStatus = jobs.map(job => ({
      ...job,
      hasApplied: Boolean(userId && job.applications && job.applications.length > 0),
    }));

    // Debug log for development
    if (process.env.NODE_ENV === 'development' && userId) {
      console.log(`User ${userId} browsing jobs. Found ${jobsWithApplicationStatus.filter(j => j.hasApplied).length} applied jobs out of ${jobsWithApplicationStatus.length} total jobs.`);
    }

    res.json({
      success: true,
      jobs: jobsWithApplicationStatus,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    next(error);
  }
};

const getJobById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const job = await prisma.job.findUnique({
      where: { id },
      include: {
        client: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
        applications: {
          include: {
            freelancer: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                skills: true,
              },
            },
          },
        },
      },
    });

    if (!job) {
      return next(new AppError('Job not found', 404));
    }

    res.json({
      success: true,
      job,
    });
  } catch (error) {
    next(error);
  }
};

const updateJob = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { title, description, budget, requiredSkills, category, status } = req.body;
    const clientId = req.user.id;

    const existingJob = await prisma.job.findUnique({
      where: { id },
    });

    if (!existingJob) {
      return next(new AppError('Job not found', 404));
    }

    if (existingJob.clientId !== clientId) {
      return next(new AppError('Not authorized to update this job', 403));
    }

    const job = await prisma.job.update({
      where: { id },
      data: {
        ...(title && { title }),
        ...(description && { description }),
        ...(budget && { budget }),
        ...(requiredSkills && { requiredSkills }),
        ...(category && { category }),
        ...(status && { status }),
      },
      include: {
        client: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
      },
    });

    res.json({
      success: true,
      message: 'Job updated successfully',
      job,
    });
  } catch (error) {
    next(error);
  }
};

const deleteJob = async (req, res, next) => {
  try {
    const { id } = req.params;
    const clientId = req.user.id;

    const existingJob = await prisma.job.findUnique({
      where: { id },
    });

    if (!existingJob) {
      return next(new AppError('Job not found', 404));
    }

    if (existingJob.clientId !== clientId) {
      return next(new AppError('Not authorized to delete this job', 403));
    }

    await prisma.job.delete({
      where: { id },
    });

    res.json({
      success: true,
      message: 'Job deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};

const applyToJob = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { coverLetter, bidAmount } = req.body;
    const freelancerId = req.user.id;

    const job = await prisma.job.findUnique({
      where: { id },
    });

    if (!job) {
      return next(new AppError('Job not found', 404));
    }

    if (job.status !== 'OPEN') {
      return next(new AppError('Job is no longer accepting applications', 400));
    }

    if (job.clientId === freelancerId) {
      return next(new AppError('Cannot apply to your own job', 400));
    }

    const existingApplication = await prisma.jobApplication.findUnique({
      where: {
        jobId_freelancerId: {
          jobId: id,
          freelancerId,
        },
      },
    });

    if (existingApplication) {
      return next(new AppError('You have already applied to this job', 400));
    }

    const application = await prisma.jobApplication.create({
      data: {
        jobId: id,
        freelancerId,
        coverLetter,
        bidAmount,
      },
      include: {
        freelancer: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            skills: true,
          },
        },
        job: {
          select: {
            id: true,
            title: true,
          },
        },
      },
    });

    res.status(201).json({
      success: true,
      message: 'Application submitted successfully',
      application,
    });
  } catch (error) {
    next(error);
  }
};

const getMyJobs = async (req, res, next) => {
  try {
    const clientId = req.user.id;
    const { status } = req.query;

    const where = {
      clientId,
      ...(status && { status }),
    };

    const jobs = await prisma.job.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        _count: {
          select: { applications: true },
        },
        applications: {
          include: {
            freelancer: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true,
                skills: true,
              },
            },
          },
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    res.json({
      success: true,
      jobs,
    });
  } catch (error) {
    next(error);
  }
};

const getMyApplications = async (req, res, next) => {
  try {
    const freelancerId = req.user.id;
    const { status } = req.query;

    const where = {
      freelancerId,
      ...(status && { status }),
    };

    const applications = await prisma.jobApplication.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        job: {
          select: {
            id: true,
            title: true,
            budget: true,
            status: true,
            client: {
              select: {
                firstName: true,
                lastName: true,
              },
            },
          },
        },
      },
    });

    res.json({
      success: true,
      applications,
    });
  } catch (error) {
    next(error);
  }
};

const getJobApplications = async (req, res, next) => {
  try {
    const { id } = req.params;
    const clientId = req.user.id;

    // Verify that the job belongs to the client
    const job = await prisma.job.findUnique({
      where: { id },
      select: { clientId: true, title: true },
    });

    if (!job) {
      return next(new AppError('Job not found', 404));
    }

    if (job.clientId !== clientId) {
      return next(new AppError('Not authorized to view applications for this job', 403));
    }

    const applications = await prisma.jobApplication.findMany({
      where: { jobId: id },
      orderBy: { createdAt: 'desc' },
      include: {
        freelancer: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            skills: true,
          },
        },
      },
    });

    res.json({
      success: true,
      job: { id, title: job.title },
      applications,
    });
  } catch (error) {
    next(error);
  }
};

const updateApplicationStatus = async (req, res, next) => {
  try {
    const { id } = req.params; // application id
    const { status } = req.body; // ACCEPTED, REJECTED, PENDING
    const clientId = req.user.id;

    // Verify the application exists and belongs to client's job
    const application = await prisma.jobApplication.findUnique({
      where: { id },
      include: {
        job: {
          select: { clientId: true, title: true },
        },
        freelancer: {
          select: { firstName: true, lastName: true, email: true },
        },
      },
    });

    if (!application) {
      return next(new AppError('Application not found', 404));
    }

    if (application.job.clientId !== clientId) {
      return next(new AppError('Not authorized to update this application', 403));
    }

    // Update application status
    const updatedApplication = await prisma.jobApplication.update({
      where: { id },
      data: { status },
      include: {
        freelancer: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            skills: true,
          },
        },
      },
    });

    // If accepted, update job status to IN_PROGRESS
    if (status === 'ACCEPTED') {
      await prisma.job.update({
        where: { id: application.jobId },
        data: { status: 'IN_PROGRESS' },
      });
    }

    res.json({
      success: true,
      message: `Application ${status.toLowerCase()} successfully`,
      application: updatedApplication,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
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
};