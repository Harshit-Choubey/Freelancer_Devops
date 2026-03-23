const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { AppError } = require('../utils/helpers');

class UploadService {
  constructor() {
    this.uploadDir = process.env.UPLOAD_DIR || './uploads';
    this.maxFileSize = parseInt(process.env.MAX_FILE_SIZE) || 5 * 1024 * 1024; // 5MB
    this.allowedTypes = process.env.ALLOWED_FILE_TYPES?.split(',') || [
      'image/jpeg',
      'image/png',
      'image/jpg',
    ];

    // Ensure upload directory exists
    this.ensureUploadDir();
  }

  ensureUploadDir() {
    if (!fs.existsSync(this.uploadDir)) {
      fs.mkdirSync(this.uploadDir, { recursive: true });
    }
  }

  // Configure multer storage
  getStorage() {
    return multer.diskStorage({
      destination: (req, file, cb) => {
        cb(null, this.uploadDir);
      },
      filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const ext = path.extname(file.originalname);
        cb(null, file.fieldname + '-' + uniqueSuffix + ext);
      },
    });
  }

  // File filter function
  fileFilter(req, file, cb) {
    if (this.allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new AppError(`File type ${file.mimetype} is not allowed`, 400), false);
    }
  }

  // Create multer upload middleware
  createUploadMiddleware(fieldName = 'file', options = {}) {
    const upload = multer({
      storage: this.getStorage(),
      limits: {
        fileSize: options.maxFileSize || this.maxFileSize,
      },
      fileFilter: this.fileFilter.bind(this),
    });

    return upload.single(fieldName);
  }

  // Create multiple files upload middleware
  createMultipleUploadMiddleware(fieldName = 'files', maxCount = 5, options = {}) {
    const upload = multer({
      storage: this.getStorage(),
      limits: {
        fileSize: options.maxFileSize || this.maxFileSize,
      },
      fileFilter: this.fileFilter.bind(this),
    });

    return upload.array(fieldName, maxCount);
  }

  // Delete file
  deleteFile(filename) {
    try {
      const filePath = path.join(this.uploadDir, filename);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error deleting file:', error);
      return false;
    }
  }

  // Get file info
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
      console.error('Error getting file info:', error);
      return null;
    }
  }

  // Validate file type
  isValidFileType(mimetype) {
    return this.allowedTypes.includes(mimetype);
  }

  // Get allowed file types
  getAllowedTypes() {
    return this.allowedTypes;
  }

  // Clean up old files (optional utility)
  cleanupOldFiles(daysOld = 30) {
    try {
      const files = fs.readdirSync(this.uploadDir);
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - daysOld);

      let deletedCount = 0;

      files.forEach(file => {
        const filePath = path.join(this.uploadDir, file);
        const stats = fs.statSync(filePath);

        if (stats.birthtime < cutoffDate) {
          fs.unlinkSync(filePath);
          deletedCount++;
        }
      });

      console.log(`Cleaned up ${deletedCount} old files`);
      return deletedCount;
    } catch (error) {
      console.error('Error cleaning up old files:', error);
      return 0;
    }
  }
}

module.exports = new UploadService();