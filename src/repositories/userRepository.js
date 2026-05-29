const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

class UserRepository {
  async findById(id) {
    return await prisma.user.findUnique({
      where: { id },
    });
  }

  async findByEmail(email) {
    return await prisma.user.findUnique({
      where: { email },
    });
  }

  async create(userData) {
    return await prisma.user.create({
      data: userData,
    });
  }

  async update(id, updateData) {
    return await prisma.user.update({
      where: { id },
      data: updateData,
    });
  }

  // ─── Update Profile (returns public fields only) ──────────────────────────
  async updateProfile(id, data) {
    return await prisma.user.update({
      where: { id },
      data,
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
  }

  // ─── Find Freelancers (paginated) ─────────────────────────────────────────
  async findFreelancers({ skip, take, skills, search }) {
    const where = {
      role: 'FREELANCER',
      isVerified: true,
      ...(skills && skills.length > 0 && { skills: { hasSome: skills } }),
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
        skip,
        take,
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

    return {
      freelancers,
      pagination: {
        page: Math.floor(skip / take) + 1,
        limit: take,
        total,
        pages: Math.ceil(total / take),
      },
    };
  }

  // ─── Find Freelancer By ID ────────────────────────────────────────────────
  async findFreelancerById(id) {
    return await prisma.user.findUnique({
      where: { id, role: 'FREELANCER', isVerified: true },
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
              select: { title: true, budget: true, status: true },
            },
          },
        },
      },
    });
  }

  // ─── Dashboard Stats ──────────────────────────────────────────────────────
  async getDashboardStats(userId, userRole) {
    if (userRole === 'CLIENT') {
      const [activeJobs, totalApplications, completedJobs, totalSpent] = await Promise.all([
        prisma.job.count({ where: { clientId: userId, status: 'OPEN' } }),
        prisma.jobApplication.count({ where: { job: { clientId: userId } } }),
        prisma.job.count({ where: { clientId: userId, status: 'COMPLETED' } }),
        prisma.job.aggregate({
          where: { clientId: userId, status: 'COMPLETED' },
          _sum: { budget: true },
        }),
      ]);

      return {
        activeJobs,
        totalApplications,
        completedJobs,
        totalSpent: totalSpent._sum.budget || 0,
      };
    }

    // FREELANCER
    const [totalApplications, activeProjects, completedProjects, totalEarned] = await Promise.all([
      prisma.jobApplication.count({ where: { freelancerId: userId } }),
      prisma.jobApplication.count({
        where: { freelancerId: userId, status: 'ACCEPTED', job: { status: 'IN_PROGRESS' } },
      }),
      prisma.jobApplication.count({
        where: { freelancerId: userId, status: 'ACCEPTED', job: { status: 'COMPLETED' } },
      }),
      prisma.jobApplication.aggregate({
        where: { freelancerId: userId, status: 'ACCEPTED', job: { status: 'COMPLETED' } },
        _sum: { bidAmount: true },
      }),
    ]);

    return {
      totalApplications,
      activeProjects,
      completedProjects,
      totalEarned: totalEarned._sum.bidAmount || 0,
    };
  }
}

module.exports = new UserRepository();
