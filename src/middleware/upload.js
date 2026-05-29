const multer = require('multer');
const path = require('path');
const crypto = require('crypto');
const { AppError } = require('../utils/errors');
const logger = require('../utils/logger');
const env = require('../config/env');

const MAX_SIZE = env.UPLOAD.MAX_SIZE;
const UPLOAD_DIR = env.UPLOAD.DIR;

const ALLOWED_MIME_TYPES = [
  'image/jpeg',
  'image/png',
  'image/jpg',
  'image/webp',
];

// ─── Secure Storage ───────────────────────────────────────────────────────────
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, UPLOAD_DIR);
  },
  filename: (req, file, cb) => {
    // Secure filename: random hex + timestamp, no user-supplied names
    const ext = path.extname(file.originalname).toLowerCase();
    const secureFilename = `${crypto.randomBytes(16).toString('hex')}-${Date.now()}${ext}`;
    cb(null, secureFilename);
  },
});

// ─── MIME Type Filter ─────────────────────────────────────────────────────────
const fileFilter = (req, file, cb) => {
  if (ALLOWED_MIME_TYPES.includes(file.mimetype)) {
    cb(null, true);
  } else {
    logger.upload('Rejected file upload: invalid MIME type', {
      mimetype: file.mimetype,
      originalName: file.originalname,
      userId: req.user?.id,
    });
    cb(new AppError(`Invalid file type. Allowed: ${ALLOWED_MIME_TYPES.join(', ')}`, 400), false);
  }
};

// ─── Path Traversal Prevention ───────────────────────────────────────────────
const sanitizeFilename = (req, res, next) => {
  if (req.file) {
    // Ensure the resolved path stays within the upload directory
    const resolvedPath = path.resolve(UPLOAD_DIR, req.file.filename);
    const resolvedBase = path.resolve(UPLOAD_DIR);

    if (!resolvedPath.startsWith(resolvedBase)) {
      logger.upload('Path traversal attempt detected', { userId: req.user?.id });
      return next(new AppError('Invalid file path', 400));
    }

    logger.upload('File uploaded successfully', {
      userId: req.user?.id,
      filename: req.file.filename,
      size: req.file.size,
      mimetype: req.file.mimetype,
    });
  }
  next();
};

// ─── Multer Instance ──────────────────────────────────────────────────────────
const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: MAX_SIZE,
    files: 1, // max 1 file per request
  },
});

// ─── Error Handler for Multer ─────────────────────────────────────────────────
const handleUploadError = (err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return next(new AppError(`File too large. Max size: ${MAX_SIZE / 1024 / 1024}MB`, 400));
    }
    return next(new AppError(`Upload error: ${err.message}`, 400));
  }
  next(err);
};

module.exports = { upload, sanitizeFilename, handleUploadError };
