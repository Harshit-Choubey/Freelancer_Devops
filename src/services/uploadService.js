const multer = require('multer');
const path = require('path');
const fs = require('fs');
const crypto = require('crypto');
const { AppError } = require('../utils/errors');
const logger = require('../utils/logger');
const env = require('../config/env');

/**
 * UploadService — Production-grade file upload handler.
 * - Reads all configuration from centralized env.js (Docker-ready)
 * - Secure filename generation (no user-supplied names)
 * - MIME type allowlist enforcement
 * - Multer error handling wrapper
 * - Logger-based observability (no console.* calls)
 */
class UploadService {
  constructor() {
    this.uploadDir = env.UPLOAD.DIR;
    this.maxFileSize = env.UPLOAD.MAX_SIZE;
    this.allowedTypes = env.UPLOAD.ALLOWED_TYPES;

    // Ensure upload directory exists at startup
    this._ensureUploadDir();
  }

  _ensureUploadDir() {
    if (!fs.existsSync(this.uploadDir)) {
      fs.mkdirSync(this.uploadDir, { recursive: true });
      logger.upload('Upload directory created', { dir: this.uploadDir });
    }
  }

  // ─── Secure Storage Config ────────────────────────────────────────────────
  _getStorage() {
    return multer.diskStorage({
      destination: (req, file, cb) => {
        cb(null, this.uploadDir);
      },
      filename: (req, file, cb) => {
        // Secure: cryptographically random hex + timestamp, no user-supplied names
        const ext = path.extname(file.originalname).toLowerCase();
        const secureFilename = `${crypto.randomBytes(16).toString('hex')}-${Date.now()}${ext}`;
        cb(null, secureFilename);
      },
    });
  }

  // ─── File Filter ──────────────────────────────────────────────────────────
  _fileFilter(req, file, cb) {
    if (this.allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      logger.upload('Rejected file upload: invalid MIME type', {
        mimetype: file.mimetype,
        userId: req.user?.id,
      });
      cb(new AppError(`File type '${file.mimetype}' is not allowed`, 400), false);
    }
  }

  // ─── Single File Upload Middleware ────────────────────────────────────────
  createUploadMiddleware(fieldName = 'file', options = {}) {
    const upload = multer({
      storage: this._getStorage(),
      limits: {
        fileSize: options.maxFileSize || this.maxFileSize,
        files: 1,
      },
      fileFilter: this._fileFilter.bind(this),
    });

    return upload.single(fieldName);
  }

  // ─── Multiple Files Upload Middleware ─────────────────────────────────────
  createMultipleUploadMiddleware(fieldName = 'files', maxCount = 5, options = {}) {
    const upload = multer({
      storage: this._getStorage(),
      limits: {
        fileSize: options.maxFileSize || this.maxFileSize,
      },
      fileFilter: this._fileFilter.bind(this),
    });

    return upload.array(fieldName, maxCount);
  }

  // ─── Delete File ──────────────────────────────────────────────────────────
  deleteFile(filename) {
    try {
      const filePath = path.join(this.uploadDir, filename);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
        logger.upload('File deleted', { filename });
        return true;
      }
      return false;
    } catch (error) {
      logger.sysError('Error deleting file', error);
      return false;
    }
  }

  // ─── Get File Info ────────────────────────────────────────────────────────
  getFileInfo(filename) {
    try {
      const filePath = path.join(this.uploadDir, filename);
      if (fs.existsSync(filePath)) {
        const stats = fs.statSync(filePath);
        return {
          filename,
          size: stats.size,
          createdAt: stats.birthtime,
          modifiedAt: stats.mtime,
        };
      }
      return null;
    } catch (error) {
      logger.sysError('Error getting file info', error);
      return null;
    }
  }

  // ─── Multer Error Handler ─────────────────────────────────────────────────
  handleUploadError(err, req, res, next) {
    if (err instanceof multer.MulterError) {
      if (err.code === 'LIMIT_FILE_SIZE') {
        return next(new AppError(`File too large. Max: ${this.maxFileSize / 1024 / 1024}MB`, 400));
      }
      return next(new AppError(`Upload error: ${err.message}`, 400));
    }
    next(err);
  }
}

module.exports = new UploadService();