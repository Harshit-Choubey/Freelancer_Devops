require('dotenv').config();

const env = {
  NODE_ENV: process.env.NODE_ENV || 'development',
  PORT: parseInt(process.env.PORT || '3000', 10),
  DATABASE_URL: process.env.DATABASE_URL,
  JWT_SECRET: process.env.JWT_SECRET || 'fallback-secret-do-not-use-in-prod',
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '7d',
  FRONTEND_URL: process.env.FRONTEND_URL || 'http://localhost:3000',
  EMAIL: {
    USER: process.env.EMAIL_USER,
    PASS: process.env.EMAIL_PASS,
  },
  UPLOAD: {
    DIR: process.env.UPLOAD_DIR || './uploads',
    MAX_SIZE: parseInt(process.env.MAX_FILE_SIZE || '5242880', 10), // 5MB default
    ALLOWED_TYPES: (process.env.ALLOWED_FILE_TYPES || 'image/jpeg,image/png,image/jpg,image/webp').split(','),
  },
  REDIS: {
    URL: process.env.REDIS_URL || 'redis://127.0.0.1:6379',
    ENABLED: process.env.REDIS_ENABLED === 'true',
  },
};

const validateEnv = () => {
  const required = ['DATABASE_URL'];
  if (env.NODE_ENV === 'production') {
    required.push('JWT_SECRET', 'FRONTEND_URL');
  }

  const missing = required.filter((key) => !process.env[key]);
  if (missing.length > 0) {
    throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
  }

  // Warn about insecure fallbacks in production
  if (env.NODE_ENV === 'production' && env.JWT_SECRET === 'fallback-secret-do-not-use-in-prod') {
    throw new Error('JWT_SECRET must be set in production');
  }
};

validateEnv();

module.exports = env;
