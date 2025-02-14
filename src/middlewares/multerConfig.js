const multer = require('multer');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const { createUploadDirectories } = require('../utils/fileUtils');

// Create necessary directories
createUploadDirectories();

// Define allowed file types
const ALLOWED_FILE_TYPES = {
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': 'xlsx',
  'application/pdf': 'pdf',
  'image/jpeg': 'jpg',
  'image/jpg': 'jpg',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'docx'
};

// Configure storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(process.cwd(), process.env.UPLOAD_DIR || 'uploads', 'temp');
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const fileExt = ALLOWED_FILE_TYPES[file.mimetype];
    const fileName = `${uuidv4()}.${fileExt}`;
    cb(null, fileName);
  }
});

// Configure multer
const upload = multer({
  storage: storage,
  fileFilter: (req, file, cb) => {
    if (ALLOWED_FILE_TYPES[file.mimetype]) {
      cb(null, true);
    } else {
      cb(new Error(`Invalid file type. Allowed types: ${Object.values(ALLOWED_FILE_TYPES).join(', ')}`), false);
    }
  },
  limits: {
    fileSize: parseInt(process.env.MAX_FILE_SIZE) || 5 * 1024 * 1024, // Default 5MB
    files: parseInt(process.env.MAX_FILES) || 5 // Default 5 files
  }
});

// Error handler middleware
const handleMulterError = (err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        success: false,
        error: `File size too large. Maximum size is ${process.env.MAX_FILE_SIZE / (1024 * 1024)}MB`
      });
    }
    if (err.code === 'LIMIT_FILE_COUNT') {
      return res.status(400).json({
        success: false,
        error: `Too many files. Maximum is ${process.env.MAX_FILES} files`
      });
    }
  }
  if (err.message.includes('Invalid file type')) {
    return res.status(400).json({
      success: false,
      error: err.message
    });
  }
  next(err);
};

module.exports = {
  upload,
  handleMulterError
}; 