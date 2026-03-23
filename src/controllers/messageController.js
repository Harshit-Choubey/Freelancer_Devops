const { PrismaClient } = require('@prisma/client');
const { AppError } = require('../utils/helpers');

const prisma = new PrismaClient();

const sendMessage = async (req, res, next) => {
  try {
    const { jobId, content } = req.body;
    const senderId = req.user.id;

    // Verify job exists and user has access
    const job = await prisma.job.findUnique({
      where: { id: jobId },
      include: {
        applications: {
          where: { freelancerId: senderId },
        },
      },
    });

    if (!job) {
      return next(new AppError('Job not found', 404));
    }

    // Check if user is client or has applied to the job
    const hasAccess = job.clientId === senderId || job.applications.length > 0;
    
    if (!hasAccess) {
      return next(new AppError('Not authorized to send messages for this job', 403));
    }

    const message = await prisma.message.create({
      data: {
        jobId,
        senderId,
        content,
      },
      include: {
        sender: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            role: true,
          },
        },
      },
    });

    res.status(201).json({
      success: true,
      message,
    });
  } catch (error) {
    next(error);
  }
};

const getJobMessages = async (req, res, next) => {
  try {
    const { jobId } = req.params;
    const userId = req.user.id;

    // Verify job exists and user has access
    const job = await prisma.job.findUnique({
      where: { id: jobId },
      include: {
        applications: {
          where: { freelancerId: userId },
        },
      },
    });

    if (!job) {
      return next(new AppError('Job not found', 404));
    }

    // Check if user is client or has applied to the job
    const hasAccess = job.clientId === userId || job.applications.length > 0;
    
    console.log(`🔍 Message access check - Job: ${jobId}, User: ${userId}, Client: ${job.clientId}, Applications: ${job.applications.length}, HasAccess: ${hasAccess}`);
    
    if (!hasAccess) {
      return next(new AppError('Not authorized to view messages for this job', 403));
    }

    const messages = await prisma.message.findMany({
      where: { jobId },
      orderBy: { createdAt: 'asc' },
      include: {
        sender: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            role: true,
          },
        },
      },
    });

    console.log(`📨 Returning ${messages.length} messages for job ${jobId}`);
    res.json({
      success: true,
      messages,
    });
  } catch (error) {
    next(error);
  }
};

const getMyConversations = async (req, res, next) => {
  try {
    const userId = req.user.id;

    // Get jobs where user is either client or has applied
    const jobs = await prisma.job.findMany({
      where: {
        OR: [
          { clientId: userId },
          {
            applications: {
              some: { freelancerId: userId },
            },
          },
        ],
      },
      include: {
        client: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
        applications: {
          where: { freelancerId: userId },
          select: {
            freelancer: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
              },
            },
          },
        },
        messages: {
          orderBy: { createdAt: 'desc' },
          take: 1,
          include: {
            sender: {
              select: {
                firstName: true,
                lastName: true,
              },
            },
          },
        },
        _count: {
          select: { messages: true },
        },
      },
    });

    const conversations = jobs.map(job => ({
      jobId: job.id,
      jobTitle: job.title,
      client: job.client,
      freelancer: job.applications[0]?.freelancer || null,
      lastMessage: job.messages[0] || null,
      messageCount: job._count.messages,
    }));

    res.json({
      success: true,
      conversations,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  sendMessage,
  getJobMessages,
  getMyConversations,
};