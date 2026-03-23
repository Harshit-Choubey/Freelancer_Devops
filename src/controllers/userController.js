const { PrismaClient } = require('@prisma/client');
const { AppError, hashPassword } = require('../utils/helpers');

const prisma = new PrismaClient();

const updateProfile = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { firstName, lastName, bio, skills, phone } = req.body;

    const user = await prisma.user.update({
      where: { id: userId },
      data: {
        ...(firstName && { firstName }),
        ...(lastName && { lastName }),
        ...(bio && { bio }),
        ...(skills && { skills }),
        ...(phone && { phone }),
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        bio: true,
        skills: true,
        phone: true,
        profilePicture: true,
        isVerified: true,
        createdAt: true,
      },
    });

    res.json({
      success: true,
      message: 'Profile updated successfully',
      user,
    });
  } catch (error) {
    next(error);
  }
};

const changePassword = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { currentPassword, newPassword } = req.body;

    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return next(new AppError('User not found', 404));
    }

    // Verify current password
    const { comparePassword } = require('../utils/helpers');
    const isValidPassword = await comparePassword(currentPassword, user.password);
    
    if (!isValidPassword) {
      return next(new AppError('Current password is incorrect', 400));
    }

    // Hash new password
    const hashedNewPassword = await hashPassword(newPassword);

    await prisma.user.update({
      where: { id: userId },
      data: { password: hashedNewPassword },
    });

    res.json({
      success: true,
      message: 'Password changed successfully',
    });
  } catch (error) {
    next(error);
  }
};

const getFreelancers = async (req, res, next) => {
  try {
    const { page = 1, limit = 10, skills, search } = req.query;
    const skip = (page - 1) * limit;

    const where = {
      role: 'FREELANCER',
      isVerified: true,
      ...(skills && { skills: { hasSome: skills.split(',') } }),
      ...(search && {
        OR: [
          { firstName: { contains: search, mode: 'insensitive' } },
          { lastName: { contains: search, mode: 'insensitive' } },
          { bio: { contains: search, mode: 'insensitive' } },
        ],
      }),
    };

    const [freelancers, total] = await Promise.all([
      prisma.user.findMany({
        where,
        skip: parseInt(skip),
        take: parseInt(limit),
        select: {
          id: true,
          firstName: true,
          lastName: true,
          bio: true,
          skills: true,
          profilePicture: true,
          createdAt: true,
        },
        orderBy: { createdAt: 'desc' },
      }),
      prisma.user.count({ where }),
    ]);

    res.json({
      success: true,
      freelancers,
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

const getFreelancerById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const freelancer = await prisma.user.findUnique({
      where: { 
        id,
        role: 'FREELANCER',
        isVerified: true,
      },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        bio: true,
        skills: true,
        profilePicture: true,
        createdAt: true,
        applications: {
          where: { status: 'ACCEPTED' },
          include: {
            job: {
              select: {
                title: true,
                budget: true,
                status: true,
              },
            },
          },
        },
      },
    });

    if (!freelancer) {
      return next(new AppError('Freelancer not found', 404));
    }

    // Calculate stats
    const completedProjects = freelancer.applications.filter(
      app => app.job.status === 'COMPLETED'
    ).length;

    const totalEarnings = freelancer.applications
      .filter(app => app.job.status === 'COMPLETED')
      .reduce((sum, app) => sum + app.bidAmount, 0);

    res.json({
      success: true,
      freelancer: {
        ...freelancer,
        stats: {
          completedProjects,
          totalEarnings,
          totalApplications: freelancer.applications.length,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

const uploadProfilePicture = async (req, res, next) => {
  try {
    const userId = req.user.id;
    
    if (!req.file) {
      return next(new AppError('No file uploaded', 400));
    }

    const profilePicture = `/uploads/${req.file.filename}`;

    const user = await prisma.user.update({
      where: { id: userId },
      data: { profilePicture },
      select: {
        id: true,
        profilePicture: true,
      },
    });

    res.json({
      success: true,
      message: 'Profile picture updated successfully',
      profilePicture: user.profilePicture,
    });
  } catch (error) {
    next(error);
  }
};

const getDashboardStats = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const userRole = req.user.role;

    if (userRole === 'CLIENT') {
      const [activeJobs, totalApplications, completedJobs, totalSpent] = await Promise.all([
        prisma.job.count({
          where: { clientId: userId, status: 'OPEN' },
        }),
        prisma.jobApplication.count({
          where: { job: { clientId: userId } },
        }),
        prisma.job.count({
          where: { clientId: userId, status: 'COMPLETED' },
        }),
        prisma.job.aggregate({
          where: { clientId: userId, status: 'COMPLETED' },
          _sum: { budget: true },
        }),
      ]);

      res.json({
        success: true,
        stats: {
          activeJobs,
          totalApplications,
          completedJobs,
          totalSpent: totalSpent._sum.budget || 0,
        },
      });
    } else {
      const [totalApplications, activeProjects, completedProjects, totalEarned] = await Promise.all([
        prisma.jobApplication.count({
          where: { freelancerId: userId },
        }),
        prisma.jobApplication.count({
          where: { 
            freelancerId: userId, 
            status: 'ACCEPTED',
            job: { status: 'IN_PROGRESS' },
          },
        }),
        prisma.jobApplication.count({
          where: { 
            freelancerId: userId, 
            status: 'ACCEPTED',
            job: { status: 'COMPLETED' },
          },
        }),
        prisma.jobApplication.aggregate({
          where: { 
            freelancerId: userId, 
            status: 'ACCEPTED',
            job: { status: 'COMPLETED' },
          },
          _sum: { bidAmount: true },
        }),
      ]);

      res.json({
        success: true,
        stats: {
          totalApplications,
          activeProjects,
          completedProjects,
          totalEarned: totalEarned._sum.bidAmount || 0,
        },
      });
    }
  } catch (error) {
    next(error);
  }
};

module.exports = {
  updateProfile,
  changePassword,
  getFreelancers,
  getFreelancerById,
  uploadProfilePicture,
  getDashboardStats,
};