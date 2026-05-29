const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

class MessageRepository {
  async getJobWithApplications(jobId, freelancerId) {
    return await prisma.job.findUnique({
      where: { id: jobId },
      include: {
        applications: {
          where: { freelancerId },
        },
      },
    });
  }

  async create(data) {
    return await prisma.message.create({
      data,
      include: {
        sender: {
          select: { id: true, firstName: true, lastName: true, role: true },
        },
      },
    });
  }

  async findMany(jobId) {
    return await prisma.message.findMany({
      where: { jobId },
      orderBy: { createdAt: 'asc' },
      include: {
        sender: {
          select: { id: true, firstName: true, lastName: true, role: true },
        },
      },
    });
  }

  async findMyConversations(userId) {
    return await prisma.job.findMany({
      where: {
        OR: [
          { clientId: userId },
          {
            applications: { some: { freelancerId: userId } },
          },
        ],
      },
      include: {
        client: {
          select: { id: true, firstName: true, lastName: true },
        },
        applications: {
          where: { freelancerId: userId },
          select: {
            freelancer: { select: { id: true, firstName: true, lastName: true } },
          },
        },
        messages: {
          orderBy: { createdAt: 'desc' },
          take: 1,
          include: {
            sender: { select: { firstName: true, lastName: true } },
          },
        },
        _count: {
          select: { messages: true },
        },
      },
    });
  }
}

module.exports = new MessageRepository();
