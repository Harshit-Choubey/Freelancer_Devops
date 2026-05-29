/**
 * Backend API Constants
 * ─────────────────────────────────────────────────────────────────────────────
 * Centralizes all magic strings, role names, status codes, and limits
 * used across routes, services, and repositories.
 */

// ─── User Roles ───────────────────────────────────────────────────────────────
const USER_ROLES = {
  CLIENT: 'CLIENT',
  FREELANCER: 'FREELANCER',
};

// ─── Job Statuses ─────────────────────────────────────────────────────────────
const JOB_STATUS = {
  OPEN: 'OPEN',
  IN_PROGRESS: 'IN_PROGRESS',
  COMPLETED: 'COMPLETED',
  CANCELLED: 'CANCELLED',
};

// ─── Application Statuses ─────────────────────────────────────────────────────
const APPLICATION_STATUS = {
  PENDING: 'PENDING',
  ACCEPTED: 'ACCEPTED',
  REJECTED: 'REJECTED',
};

// ─── Socket Events ────────────────────────────────────────────────────────────
const SOCKET_EVENTS = {
  // Client → Server
  JOIN_JOB: 'join-job',
  LEAVE_JOB: 'leave-job',
  SEND_MESSAGE: 'send-message',
  TYPING: 'typing',

  // Server → Client
  NEW_MESSAGE: 'new-message',
  USER_TYPING: 'user-typing',
  USER_ONLINE: 'user-online',
  USER_OFFLINE: 'user-offline',
  ERROR: 'error',
};

// ─── Rate Limit Windows ───────────────────────────────────────────────────────
const RATE_LIMITS = {
  AUTH_WINDOW_MS: 15 * 60 * 1000,   // 15 minutes
  AUTH_MAX_ATTEMPTS: 5,
  GENERAL_WINDOW_MS: 15 * 60 * 1000,
  GENERAL_MAX_REQUESTS: 100,
};

// ─── OTP Configuration ────────────────────────────────────────────────────────
const OTP = {
  EXPIRES_IN_MS: 10 * 60 * 1000, // 10 minutes
  LENGTH: 6,
};

// ─── Pagination Defaults ──────────────────────────────────────────────────────
const PAGINATION = {
  DEFAULT_PAGE: 1,
  DEFAULT_LIMIT: 10,
  MAX_LIMIT: 100,
};

module.exports = {
  USER_ROLES,
  JOB_STATUS,
  APPLICATION_STATUS,
  SOCKET_EVENTS,
  RATE_LIMITS,
  OTP,
  PAGINATION,
};
