const { models } = require('../models');
const Bull = require('bull');
const path = require('path');
const fs = require('fs').promises;
const { v4: uuidv4 } = require('uuid');
const { 
  successResponse, 
  createdResponse, 
  errorResponse, 
  notFoundResponse 
} = require('../helpers/apiResponse');

// Create upload queue
const uploadQueue = new Bull('file-upload-queue', {
  redis: {
    host: process.env.REDIS_HOST || 'localhost',
    port: process.env.REDIS_PORT || 6379
  }
});

class FileController {
  static async uploadFiles(req, res) {
    try {
      if (!req.files || req.files.length === 0) {
        return errorResponse(res, 'No files uploaded', 400);
      }

      const uploadedBy = req.user.id;
      const files = req.files;
      
      // Create upload job
      const uploadJob = await models.UploadJob.create({
        userId: uploadedBy,
        totalFiles: files.length,
        status: 'pending'
      });

      // Process each file
      const uploadedFiles = await Promise.all(files.map(async (file) => {
        // Create file record
        const fileRecord = await models.File.create({
          filename: file.filename,
          originalName: file.originalname,
          mimeType: file.mimetype,
          size: file.size,
          path: path.join('uploads', 'processed', file.filename),
          uploadedBy,
          status: 'processing'
        });

        // Move file from temp to processed directory
        const tempPath = file.path;
        const processedPath = path.join(process.cwd(), 'uploads', 'processed', file.filename);
        
        await fs.rename(tempPath, processedPath);

        return fileRecord;
      }));

      // Log activity
      await models.ActivityLog.create({
        userId: uploadedBy,
        action: 'FILE_UPLOAD',
        details: {
          jobId: uploadJob.id,
          fileCount: files.length
        }
      });

      return successResponse(res, 'Files uploaded successfully', {
        jobId: uploadJob.id,
        files: uploadedFiles
      });
    } catch (error) {
      console.error('Upload error:', error);
      return errorResponse(res, error.message, 500);
    }
  }

  static async getUploadStatus(req, res) {
    try {
      const { jobId } = req.params;
      const job = await models.UploadJob.findByPk(jobId);

      if (!job) {
        return notFoundResponse(res, 'Upload job not found');
      }

      if (job.userId !== req.user.id) {
        return errorResponse(res, 'Not authorized to view this job', 403);
      }

      const files = await models.File.findAll({
        where: { uploadedBy: req.user.id },
        order: [['createdAt', 'DESC']]
      });

      return successResponse(res, 'Upload status retrieved', { job, files });
    } catch (error) {
      return errorResponse(res, error.message);
    }
  }

  static async downloadFile(req, res) {
    try {
      const { fileId } = req.params;
      const file = await models.File.findByPk(fileId);

      if (!file) {
        return notFoundResponse(res, 'File not found');
      }

      if (file.uploadedBy !== req.user.id) {
        return errorResponse(res, 'Not authorized to download this file', 403);
      }

      // Log activity
      await models.ActivityLog.create({
        userId: req.user.id,
        action: 'FILE_DOWNLOAD',
        details: { fileId }
      });

      const filePath = path.join(process.cwd(), file.path);
      res.download(filePath, file.originalName);
    } catch (error) {
      return errorResponse(res, error.message);
    }
  }

  static async getUserFiles(req, res) {
    try {
      const { page = 1, limit = 10 } = req.query;
      const offset = (page - 1) * limit;

      const files = await models.File.findAndCountAll({
        where: { uploadedBy: req.user.id },
        order: [['createdAt', 'DESC']],
        limit: parseInt(limit),
        offset: parseInt(offset)
      });

      return successResponse(res, 'Files retrieved successfully', {
        files: files.rows,
        total: files.count,
        currentPage: parseInt(page),
        totalPages: Math.ceil(files.count / limit)
      });
    } catch (error) {
      return errorResponse(res, error.message);
    }
  }

  static async deleteFile(req, res) {
    try {
      const { fileId } = req.params;
      const file = await models.File.findByPk(fileId);

      if (!file) {
        return notFoundResponse(res, 'File not found');
      }

      if (file.uploadedBy !== req.user.id) {
        return errorResponse(res, 'Not authorized to delete this file', 403);
      }

      // Delete physical file
      const filePath = path.join(process.cwd(), file.path);
      await fs.unlink(filePath);

      // Delete database record
      await file.destroy();

      // Log activity
      await models.ActivityLog.create({
        userId: req.user.id,
        action: 'FILE_DELETE',
        details: { fileId }
      });

      return successResponse(res, 'File deleted successfully');
    } catch (error) {
      return errorResponse(res, error.message);
    }
  }
}

// Process files in the queue
uploadQueue.process('process-file', async (job) => {
  const { fileId, jobId, tempPath, uploadPath } = job.data;

  try {
    // Create upload directory if it doesn't exist
    const uploadDir = path.dirname(uploadPath);
    await fs.mkdir(uploadDir, { recursive: true });

    // Move file from temp location to final destination
    await fs.rename(tempPath, uploadPath);

    // Update file status
    await models.File.update(
      { status: 'completed' },
      { where: { id: fileId } }
    );

    // Update job progress
    const job = await models.UploadJob.findByPk(jobId);
    await job.increment('processedFiles');

    // Check if all files are processed
    if (job.processedFiles === job.totalFiles) {
      await job.update({ status: 'completed' });
    }

    return { success: true };
  } catch (error) {
    // Update file status to failed
    await models.File.update(
      { status: 'failed' },
      { where: { id: fileId } }
    );

    // Update job status
    await models.UploadJob.update(
      { 
        status: 'failed',
        error: error.message
      },
      { where: { id: jobId } }
    );

    throw error;
  }
});

module.exports = FileController; 