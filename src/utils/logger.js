const winston = require('winston');
const path = require('path');

// Define log levels
const levels = {
  error: 0,
  warn: 1,
  info: 2,
  http: 3,
  debug: 4,
};

// Define colors for each level
const colors = {
  error: 'red',
  warn: 'yellow',
  info: 'green',
  http: 'magenta',
  debug: 'white',
};

// Tell winston that you want to link the colors
winston.addColors(colors);

// Define which level to log based on environment
const level = () => {
  const env = process.env.NODE_ENV || 'development';
  const isDevelopment = env === 'development';
  return isDevelopment ? 'debug' : 'warn';
};

// Define format for logs
const format = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss:ms' }),
  winston.format.colorize({ all: true }),
  winston.format.printf(
    (info) => `${info.timestamp} ${info.level}: ${info.message}`,
  ),
);

// Define transports
const transports = [
  // Console transport
  new winston.transports.Console({
    format: winston.format.combine(
      winston.format.colorize(),
      winston.format.simple()
    ),
  }),
  
  // File transport for errors
  new winston.transports.File({
    filename: path.join('logs', 'error.log'),
    level: 'error',
    format: winston.format.combine(
      winston.format.timestamp(),
      winston.format.json()
    ),
  }),
  
  // File transport for all logs
  new winston.transports.File({
    filename: path.join('logs', 'combined.log'),
    format: winston.format.combine(
      winston.format.timestamp(),
      winston.format.json()
    ),
  }),
];

// Create logger
const logger = winston.createLogger({
  level: level(),
  levels,
  format,
  transports,
  // Don't exit on handled exceptions
  exitOnError: false,
});

// Create logs directory if it doesn't exist
const fs = require('fs');
const logsDir = 'logs';
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir);
}

// Stream for Morgan HTTP logging
logger.stream = {
  write: (message) => {
    logger.http(message.trim());
  },
};

// Helper methods
logger.logError = (error, req = null) => {
  const errorInfo = {
    message: error.message,
    stack: error.stack,
    ...(req && {
      url: req.url,
      method: req.method,
      ip: req.ip,
      userAgent: req.get('User-Agent'),
    }),
  };
  
  logger.error(JSON.stringify(errorInfo));
};

logger.logRequest = (req, res, responseTime) => {
  const logInfo = {
    method: req.method,
    url: req.url,
    status: res.statusCode,
    responseTime: `${responseTime}ms`,
    ip: req.ip,
    userAgent: req.get('User-Agent'),
  };
  
  logger.http(JSON.stringify(logInfo));
};

logger.logUserAction = (userId, action, details = {}) => {
  const logInfo = {
    userId,
    action,
    details,
    timestamp: new Date().toISOString(),
  };
  
  logger.info(`User Action: ${JSON.stringify(logInfo)}`);
};

logger.logSystemEvent = (event, details = {}) => {
  const logInfo = {
    event,
    details,
    timestamp: new Date().toISOString(),
  };
  
  logger.info(`System Event: ${JSON.stringify(logInfo)}`);
};

// Categorized Loggers for Production
logger.auth = (msg, data = {}) => logger.info(`[AUTH] ${msg} ${Object.keys(data).length ? JSON.stringify(data) : ''}`);
logger.socket = (msg, data = {}) => logger.info(`[SOCKET] ${msg} ${Object.keys(data).length ? JSON.stringify(data) : ''}`);
logger.job = (msg, data = {}) => logger.info(`[JOB] ${msg} ${Object.keys(data).length ? JSON.stringify(data) : ''}`);
logger.api = (msg, data = {}) => logger.info(`[API] ${msg} ${Object.keys(data).length ? JSON.stringify(data) : ''}`);
logger.sysError = (msg, error) => logger.error(`[ERROR] ${msg} ${error ? error.message : ''}`);
logger.upload = (msg, data = {}) => logger.info(`[UPLOAD] ${msg} ${Object.keys(data).length ? JSON.stringify(data) : ''}`);
logger.system = (msg, data = {}) => logger.info(`[SYSTEM] ${msg} ${Object.keys(data).length ? JSON.stringify(data) : ''}`);

module.exports = logger;