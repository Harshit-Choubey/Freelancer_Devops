const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

class JobRepository {
  async create(jobData) {
    return await prisma.job.create({
      data: jobData,
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
  }

  async findMany(where, skip, take) {
    return await prisma.job.findMany({
      where,
      skip,
      take,
      orderBy: { createdAt: 'desc' },
      include: {
        client: {
          select: { id: true, firstName: true, lastName: true },
        },
        _count: { select: { applications: true } },
      },
    });
  }

  async count(where) {
    return await prisma.job.count({ where });
  }

  async findById(id) {
    return await prisma.job.findUnique({
      where: { id },
      include: {
        client: {
          select: { id: true, firstName: true, lastName: true, email: true },
        },
        applications: {
          include: {
            freelancer: {
              select: { id: true, firstName: true, lastName: true, skills: true },
            },
          },
        },
      },
    });
  }

  async update(id, updateData) {
    return await prisma.job.update({
      where: { id },
      data: updateData,
      include: {
        client: {
          select: { id: true, firstName: true, lastName: true },
        },
      },
    });
  }

  async delete(id) {
    return await prisma.job.delete({
      where: { id },
    });
  }

  async checkExistingApplication(jobId, freelancerId) {
    return await prisma.jobApplication.findUnique({
      where: {
        jobId_freelancerId: { jobId, freelancerId },
      },
    });
  }

  async createApplication(applicationData) {
    return await prisma.jobApplication.create({
      data: applicationData,
      include: {
        freelancer: {
          select: { id: true, firstName: true, lastName: true, skills: true },
        },
        job: {
          select: { id: true, title: true },
        },
      },
    });
  }

  async findMyJobs(clientId, status) {
    const where = { clientId, ...(status && { status }) };
    return await prisma.job.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        _count: { select: { applications: true } },
        applications: {
          include: {
            freelancer: {
              select: { id: true, firstName: true, lastName: true, email: true, skills: true },
            },
          },
          orderBy: { createdAt: 'desc' },
        },
      },
    });
  }

  async findMyApplications(freelancerId, status) {
    const where = { freelancerId, ...(status && { status }) };
    return await prisma.jobApplication.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        job: {
          select: {
            id: true,
            title: true,
            budget: true,
            status: true,
            client: { select: { firstName: true, lastName: true } },
          },
        },
      },
    });
  }

  async findJobApplications(jobId) {
    return await prisma.jobApplication.findMany({
      where: { jobId },
      orderBy: { createdAt: 'desc' },
      include: {
        freelancer: {
          select: { id: true, firstName: true, lastName: true, email: true, skills: true },
        },
      },
    });
  }

  async findApplicationById(id) {
    return await prisma.jobApplication.findUnique({
      where: { id },
      include: {
        job: { select: { clientId: true, title: true } },
        freelancer: { select: { firstName: true, lastName: true, email: true } },
      },
    });
  }

  async updateApplicationStatus(id, status) {
    return await prisma.jobApplication.update({
      where: { id },
      data: { status },
      include: {
        freelancer: {
          select: { id: true, firstName: true, lastName: true, email: true, skills: true },
        },
      },
    });
  }
}

module.exports = new JobRepository();
