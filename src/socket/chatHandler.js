const messageRepository = require('../repositories/messageRepository');
const logger = require('../utils/logger');

module.exports = (io, socket) => {
  // Track rooms this socket has joined to prevent duplicate joins
  const joinedRooms = new Set();

  // ─── Verify Job Access ───────────────────────────────────────────────────
  const verifyJobAccess = async (userId, jobId) => {
    try {
      const job = await messageRepository.getJobWithApplications(jobId, userId);
      if (!job) return false;
      if (job.clientId === userId) return true;
      return job.applications.some(app => app.freelancerId === userId);
    } catch (error) {
      logger.socket('Job access verification failed', { userId, jobId, error: error.message });
      return false;
    }
  };

  // ─── Join Job Room ────────────────────────────────────────────────────────
  socket.on('join-job', async (jobId) => {
    if (!jobId) return;
    const roomKey = `job-${jobId}`;

    // Prevent duplicate room joins for same socket
    if (joinedRooms.has(roomKey)) {
      logger.socket('Duplicate room join prevented', { userId: socket.user.id, room: roomKey });
      return;
    }

    try {
      const hasAccess = await verifyJobAccess(socket.user.id, jobId);
      if (hasAccess) {
        socket.join(roomKey);
        joinedRooms.add(roomKey);
        logger.socket('User joined room', { userId: socket.user.id, room: roomKey });
      } else {
        socket.emit('error', { message: 'Not authorized to join this job room' });
        logger.socket('Unauthorized room join attempt', { userId: socket.user.id, jobId });
      }
    } catch (error) {
      logger.socket('Room join failed', { userId: socket.user.id, jobId, error: error.message });
      socket.emit('error', { message: 'Failed to join job room' });
    }
  });

  // ─── Send Message ────────────────────────────────────────────────────────
  socket.on('send-message', async (data) => {
    if (!data?.jobId || !data?.content?.trim()) {
      return socket.emit('error', { message: 'Invalid message data' });
    }

    const { jobId, content } = data;
    const roomKey = `job-${jobId}`;

    try {
      // Re-verify access on every send (security hardening)
      const hasAccess = await verifyJobAccess(socket.user.id, jobId);
      if (!hasAccess) {
        return socket.emit('error', { message: 'Not authorized to send messages in this room' });
      }

      const message = await messageRepository.create({
        jobId,
        senderId: socket.user.id,
        content: content.trim(),
      });

      logger.socket('Message sent', { userId: socket.user.id, jobId, messageId: message.id });

      // Broadcast to entire room (including sender for UI confirmation)
      io.to(roomKey).emit('new-message', {
        ...message,
        sender: {
          id: socket.user.id,
          firstName: socket.user.firstName,
          lastName: socket.user.lastName,
        },
      });
    } catch (error) {
      logger.socket('Message send failed', { userId: socket.user.id, jobId, error: error.message });
      socket.emit('error', { message: 'Failed to send message' });
    }
  });

  // ─── Typing Indicator ─────────────────────────────────────────────────────
  socket.on('typing', (data) => {
    if (!data?.jobId) return;
    socket.to(`job-${data.jobId}`).emit('user-typing', {
      userId: socket.user.id,
      userName: `${socket.user.firstName} ${socket.user.lastName}`,
      isTyping: !!data.isTyping,
    });
  });

  // ─── Leave Room ───────────────────────────────────────────────────────────
  socket.on('leave-job', (jobId) => {
    const roomKey = `job-${jobId}`;
    socket.leave(roomKey);
    joinedRooms.delete(roomKey);
    logger.socket('User left room', { userId: socket.user.id, room: roomKey });
  });

  // ─── Cleanup on Disconnect ────────────────────────────────────────────────
  socket.on('disconnect', () => {
    // Clear room tracking set on disconnect to prevent stale state
    joinedRooms.clear();
  });
};
