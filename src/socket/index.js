const { Server } = require('socket.io');
const jwt = require('jsonwebtoken');
const env = require('../config/env');
const logger = require('../utils/logger');
const userRepository = require('../repositories/userRepository');
const chatHandler = require('./chatHandler');

class SocketServer {
  constructor() {
    this.io = null;
    // Map<userId, Set<socketId>> — supports multi-tab users
    this.connectedUsers = new Map();
  }

  initialize(server) {
    this.io = new Server(server, {
      cors: {
        origin: env.FRONTEND_URL,
        methods: ['GET', 'POST'],
        credentials: true,
      },
      // Reconnect settings
      pingTimeout: 60000,
      pingInterval: 25000,
      // Redis adapter hook (future scaling):
      // adapter: createAdapter(pubClient, subClient)
    });

    this.setupMiddleware();
    this.setupHandlers();

    logger.socket('Modular WebSocket service initialized');
  }

  setupMiddleware() {
    this.io.use(async (socket, next) => {
      try {
        const token = socket.handshake.auth?.token;
        if (!token) {
          return next(new Error('Authentication error: no token'));
        }

        const decoded = jwt.verify(token, env.JWT_SECRET);
        const user = await userRepository.findById(decoded.userId);

        if (!user) {
          return next(new Error('Authentication error: user not found'));
        }

        socket.user = user;
        next();
      } catch (error) {
        logger.socket('Socket auth failed', { error: error.message });
        next(new Error('Authentication error: invalid token'));
      }
    });
  }

  setupHandlers() {
    this.io.on('connection', (socket) => {
      const userId = socket.user.id;
      logger.socket(`User connected`, { userId, socketId: socket.id });

      // Multi-tab support: track all sockets for a user
      if (!this.connectedUsers.has(userId)) {
        this.connectedUsers.set(userId, new Set());
      }
      this.connectedUsers.get(userId).add(socket.id);

      // Broadcast online status
      socket.broadcast.emit('user-online', userId);

      // Register handlers — chatHandler binds its own listeners, no leaks
      chatHandler(this.io, socket);

      socket.on('disconnect', (reason) => {
        logger.socket(`User disconnected`, { userId, socketId: socket.id, reason });

        const userSockets = this.connectedUsers.get(userId);
        if (userSockets) {
          userSockets.delete(socket.id);
          if (userSockets.size === 0) {
            // All tabs closed — user truly offline
            this.connectedUsers.delete(userId);
            socket.broadcast.emit('user-offline', userId);
          }
        }
      });

      socket.on('error', (err) => {
        logger.socket(`Socket error`, { userId, error: err.message });
      });
    });
  }

  /**
   * Send a notification to a specific user across ALL their active tabs.
   */
  notifyUser(userId, event, data) {
    const userSockets = this.connectedUsers.get(userId);
    if (userSockets && userSockets.size > 0) {
      userSockets.forEach((socketId) => {
        this.io.to(socketId).emit(event, data);
      });
    }
  }

  getOnlineUserIds() {
    return Array.from(this.connectedUsers.keys());
  }
}

module.exports = new SocketServer();
