const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const path = require('path');
const rateLimit = require('express-rate-limit');

const errorHandler = require('./middleware/errorHandler');
const { AppError } = require('./utils/errors');
const env = require('./config/env');

// Import routes
const authRoutes = require('./routes/auth');
const jobRoutes = require('./routes/jobs');
const messageRoutes = require('./routes/messages');
const userRoutes = require('./routes/users');

const app = express();

// Security middleware
app.use(helmet());
app.use(cors({
  origin: env.FRONTEND_URL,
  credentials: true,
}));

// Rate limiting
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // 100 requests per window
});
app.use('/api', generalLimiter);

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Logging — structured HTTP request logging via Winston stream
if (env.NODE_ENV !== 'test') {
  const logger = require('./utils/logger');
  app.use(morgan('combined', { stream: logger.stream }));
}

// Static files
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));
app.use(express.static(path.join(__dirname, '../public')));

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/jobs', jobRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/users', userRoutes);

const monitoringRoutes = require('./monitoring/health');
app.use('/monitoring', monitoringRoutes);

// Email test endpoint (development only)
app.get('/api/test-email', async (req, res) => {
  if (env.NODE_ENV !== 'development') {
    return res.status(404).json({ error: 'Not found' });
  }
  
  try {
    const emailService = require('./services/emailService');
    const isReady = await emailService.testEmailConnection();
    
    res.json({
      success: isReady,
      message: isReady ? 'Email service is configured correctly' : 'Email service configuration error',
      configured: !!(env.EMAIL.USER && env.EMAIL.PASS),
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Email test failed',
      error: error.message,
    });
  }
});



// Handle undefined routes (FIXED for Express v5)
app.all('/*splat', (req, res, next) => {
  next(new AppError(`Route ${req.originalUrl} not found`, 404));
});

// Global error handler
app.use(errorHandler);

module.exports = app;
