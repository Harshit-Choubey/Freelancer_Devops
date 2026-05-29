/**
 * Frontend Constants
 * ─────────────────────────────────────────────────────────────────────────────
 * Centralizes all magic strings used in the SPA frontend.
 * Loaded as a non-module script so it's accessible globally before
 * ES modules execute.
 */

window.AppConstants = {
  // ─── User Roles ─────────────────────────────────────────────────────────
  ROLES: {
    CLIENT: 'CLIENT',
    FREELANCER: 'FREELANCER',
  },

  // ─── Job Statuses ────────────────────────────────────────────────────────
  JOB_STATUS: {
    OPEN: 'OPEN',
    IN_PROGRESS: 'IN_PROGRESS',
    COMPLETED: 'COMPLETED',
    CANCELLED: 'CANCELLED',
  },

  // ─── Application Statuses ────────────────────────────────────────────────
  APP_STATUS: {
    PENDING: 'PENDING',
    ACCEPTED: 'ACCEPTED',
    REJECTED: 'REJECTED',
  },

  // ─── Socket Events ───────────────────────────────────────────────────────
  SOCKET: {
    JOIN_JOB: 'join-job',
    LEAVE_JOB: 'leave-job',
    SEND_MESSAGE: 'send-message',
    TYPING: 'typing',
    NEW_MESSAGE: 'new-message',
    USER_TYPING: 'user-typing',
    USER_ONLINE: 'user-online',
    USER_OFFLINE: 'user-offline',
  },

  // ─── Toast Durations ─────────────────────────────────────────────────────
  TOAST: {
    SUCCESS_DURATION: 3000,
    ERROR_DURATION: 5000,
    INFO_DURATION: 3000,
  },

  // ─── Upload Limits ───────────────────────────────────────────────────────
  UPLOAD: {
    MAX_SIZE: 5 * 1024 * 1024, // 5MB
    ALLOWED_TYPES: ['image/jpeg', 'image/png', 'image/jpg', 'image/webp'],
  },
};
