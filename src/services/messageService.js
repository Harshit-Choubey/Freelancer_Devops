const messageRepository = require('../repositories/messageRepository');
const { NotFoundError, ForbiddenError } = require('../utils/errors');

class MessageService {
  async sendMessage(jobId, content, senderId) {
    const job = await messageRepository.getJobWithApplications(jobId, senderId);

    if (!job) {
      throw new NotFoundError('Job not found');
    }

    const hasAccess = job.clientId === senderId || job.applications.length > 0;
    if (!hasAccess) {
      throw new ForbiddenError('Not authorized to send messages for this job');
    }

    return await messageRepository.create({ jobId, senderId, content });
  }

  async getJobMessages(jobId, userId) {
    const job = await messageRepository.getJobWithApplications(jobId, userId);

    if (!job) {
      throw new NotFoundError('Job not found');
    }

    const hasAccess = job.clientId === userId || job.applications.length > 0;
    if (!hasAccess) {
      throw new ForbiddenError('Not authorized to view messages for this job');
    }

    return await messageRepository.findMany(jobId);
  }

  async getMyConversations(userId) {
    const jobs = await messageRepository.findMyConversations(userId);

    return jobs.map((job) => ({
      jobId: job.id,
      jobTitle: job.title,
      client: job.client,
      freelancer: job.applications[0]?.freelancer || null,
      lastMessage: job.messages[0] || null,
      messageCount: job._count.messages,
    }));
  }
}

module.exports = new MessageService();
