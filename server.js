const env = require('./src/config/env');
const app = require('./src/app');
const { PrismaClient } = require('@prisma/client');
const socketServer = require('./src/socket');
const logger = require('./src/utils/logger');
const http = require('http');
const fs = require('fs');

const prisma = new PrismaClient();
const PORT = env.PORT;

// Ensure uploads directory exists (important for fresh Docker containers)
if (!fs.existsSync(env.UPLOAD.DIR)) {
  fs.mkdirSync(env.UPLOAD.DIR, { recursive: true });
}

const startServer = async () => {
  try {
    // Test database connection
    await prisma.$connect();
    logger.system('Database connected successfully');

    // Create HTTP server
    const server = http.createServer(app);

    // Initialize modular WebSocket service
    socketServer.initialize(server);

    server.listen(PORT, () => {
      logger.system(`Server started`, {
        port: PORT,
        env: env.NODE_ENV,
        frontendUrl: env.FRONTEND_URL,
        redisEnabled: env.REDIS.ENABLED,
      });
    });

    // ─── Graceful Shutdown ────────────────────────────────────────────────────
    const shutdown = async (signal) => {
      logger.system(`${signal} received — shutting down gracefully`);

      server.close(async () => {
        await prisma.$disconnect();
        logger.system('Server closed. Database disconnected.');
        process.exit(0);
      });

      // Force kill after 10 seconds
      setTimeout(() => {
        logger.sysError('Forced shutdown after timeout', new Error('Shutdown timeout'));
        process.exit(1);
      }, 10000);
    };

    process.on('SIGTERM', () => shutdown('SIGTERM'));
    process.on('SIGINT', () => shutdown('SIGINT'));

    // Unhandled rejection safety net
    process.on('unhandledRejection', (reason, promise) => {
      logger.sysError('Unhandled Rejection', reason instanceof Error ? reason : new Error(String(reason)));
    });

    process.on('uncaughtException', (error) => {
      logger.sysError('Uncaught Exception', error);
      shutdown('UNCAUGHT_EXCEPTION');
    });

  } catch (error) {
    logger.sysError('Failed to start server', error);
    process.exit(1);
  }
};

startServer();
