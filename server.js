require('dotenv').config();
const app = require('./src/app');
const { PrismaClient } = require('@prisma/client');
const websocketService = require('./src/services/websocketService');
const http = require('http');

const prisma = new PrismaClient();
const PORT = process.env.PORT || 3000;

const startServer = async () => {
  try {
    // Test database connection
    await prisma.$connect();
    console.log('✅ Database connected successfully');

    // Create HTTP server
    const server = http.createServer(app);

    // Initialize WebSocket service
    websocketService.initialize(server);

    server.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
      console.log(`📱 Environment: ${process.env.NODE_ENV}`);
      console.log(`🌐 Frontend URL: ${process.env.FRONTEND_URL}`);
      console.log(`💬 WebSocket service enabled`);
    });

    // Graceful shutdown
    process.on('SIGTERM', async () => {
      console.log('SIGTERM received, shutting down gracefully');
      await prisma.$disconnect();
      server.close(() => {
        console.log('Process terminated');
      });
    });

  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
};

startServer();
