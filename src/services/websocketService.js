const { Server } = require("socket.io");
const jwt = require("jsonwebtoken");
const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

class WebSocketService {
  constructor() {
    this.io = null;
    this.connectedUsers = new Map(); // userId -> socketId
  }

  initialize(server) {
    this.io = new Server(server, {
      cors: {
        origin: process.env.FRONTEND_URL || "http://localhost:3000",
        methods: ["GET", "POST"],
      },
    });

    // Authentication middleware
    this.io.use(async (socket, next) => {
      try {
        const token = socket.handshake.auth.token;
        console.log("🔐 WebSocket auth attempt:", {
          hasToken: !!token,
          tokenLength: token ? token.length : 0,
          tokenStart: token ? token.substring(0, 20) + "..." : "none",
        });

        if (!token) {
          console.log("❌ No token provided");
          return next(new Error("No authentication token provided"));
        }

        // Verify JWT token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        console.log("🔓 Token decoded successfully:", {
          userId: decoded.userId,
          exp: decoded.exp,
          fullPayload: decoded,
        });

        // Check if token is expired
        if (decoded.exp && decoded.exp < Date.now() / 1000) {
          console.log("❌ Token expired");
          return next(new Error("Token expired"));
        }

        if (!decoded.userId) {
          console.log("❌ No userId in token payload");
          return next(new Error("Invalid token payload"));
        }

        const user = await prisma.user.findUnique({
          where: { id: decoded.userId },
          select: {
            id: true,
            firstName: true,
            lastName: true,
            role: true,
            email: true,
          },
        });

        if (!user) {
          console.log("❌ User not found in database for ID:", decoded.id);
          return next(new Error("User not found"));
        }

        console.log("✅ User authenticated for WebSocket:", {
          name: user.firstName,
          role: user.role,
          id: user.id,
        });

        socket.userId = user.id;
        socket.user = user;
        next();
      } catch (error) {
        console.log("❌ WebSocket authentication error:", {
          message: error.message,
          name: error.name,
          stack: error.stack.split("\n")[0],
        });
        next(new Error(`Authentication failed: ${error.message}`));
      }
    });

    this.io.on("connection", (socket) => {
      console.log(`User ${socket.user.firstName} connected: ${socket.id}`);

      // Store user connection
      this.connectedUsers.set(socket.userId, socket.id);

      // Join job-specific rooms
      socket.on("join-job", async (jobId) => {
        try {
          console.log(
            `🔍 User ${socket.user.firstName} (${socket.userId}) trying to join job room: ${jobId}`
          );
          // Verify user has access to this job
          const hasAccess = await this.verifyJobAccess(socket.userId, jobId);
          console.log(`🔐 Access verification result: ${hasAccess}`);
          if (hasAccess) {
            socket.join(`job-${jobId}`);
            console.log(
              `✅ User ${socket.user.firstName} joined job room: ${jobId}`
            );
          } else {
            console.log(
              `❌ User ${socket.user.firstName} denied access to job room: ${jobId}`
            );
            socket.emit("error", {
              message: "Not authorized to join job room",
            });
          }
        } catch (error) {
          console.error("Error joining job room:", error);
          socket.emit("error", { message: "Failed to join job room" });
        }
      });

      // Handle sending messages
      socket.on("send-message", async (data) => {
        try {
          const { jobId, content } = data;

          // Verify user has access to send messages for this job
          const hasAccess = await this.verifyJobAccess(socket.userId, jobId);
          if (!hasAccess) {
            socket.emit("error", {
              message: "Not authorized to send messages",
            });
            return;
          }

          // Save message to database
          const message = await prisma.message.create({
            data: {
              jobId,
              senderId: socket.userId,
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

          // Broadcast message to all users in the job room
          this.io.to(`job-${jobId}`).emit("new-message", message);
        } catch (error) {
          console.error("Error sending message:", error);
          socket.emit("error", { message: "Failed to send message" });
        }
      });

      // Handle typing indicators
      socket.on("typing", (data) => {
        socket.to(`job-${data.jobId}`).emit("user-typing", {
          userId: socket.userId,
          userName: `${socket.user.firstName} ${socket.user.lastName}`,
          isTyping: data.isTyping,
        });
      });

      // Handle disconnect
      socket.on("disconnect", () => {
        console.log(`User ${socket.user.firstName} disconnected: ${socket.id}`);
        this.connectedUsers.delete(socket.userId);
      });
    });

    console.log("✅ WebSocket service initialized");
  }

  async verifyJobAccess(userId, jobId) {
    try {
      const job = await prisma.job.findUnique({
        where: { id: jobId },
        include: {
          applications: {
            where: {
              freelancerId: userId,
            },
          },
        },
      });

      console.log(
        `🔍 Job access check - Job found: ${!!job}, Client ID: ${
          job?.clientId
        }, User ID: ${userId}, Applications: ${job?.applications?.length || 0}`
      );

      if (!job) return false;

      // Client can access their own jobs
      if (job.clientId === userId) return true;

      // Freelancer can access if they have applied to the job (any status)
      return job.applications.length > 0;
    } catch (error) {
      console.error("Error verifying job access:", error);
      return false;
    }
  }

  // Send notification to specific user
  notifyUser(userId, event, data) {
    const socketId = this.connectedUsers.get(userId);
    if (socketId) {
      this.io.to(socketId).emit(event, data);
    }
  }

  // Send notification to job room
  notifyJobRoom(jobId, event, data) {
    this.io.to(`job-${jobId}`).emit(event, data);
  }
}

module.exports = new WebSocketService();
