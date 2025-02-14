const express = require('express');
const router = express.Router();
const fileController = require('../controllers/fileController');
const { authenticate } = require('../middlewares/authMiddleware');
const { validateFileUpload } = require('../middlewares/validation');
const { upload, handleMulterError } = require('../middlewares/multerConfig');

/**
 * @swagger
 * components:
 *   schemas:
 *     File:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *         filename:
 *           type: string
 *         originalName:
 *           type: string
 *         mimeType:
 *           type: string
 *         size:
 *           type: integer
 *         path:
 *           type: string
 *         uploadedBy:
 *           type: string
 *           format: uuid
 *         status:
 *           type: string
 *           enum: [processing, completed, failed]
 */

/**
 * @swagger
 * /files/upload:
 *   post:
 *     summary: Upload multiple files
 *     security:
 *       - bearerAuth: []
 *     tags: [Files]
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               files:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: binary
 *     responses:
 *       201:
 *         description: Files uploaded successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 jobId:
 *                   type: string
 *                   format: uuid
 *                 files:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/File'
 */

/**
 * @swagger
 * /files/status/{jobId}:
 *   get:
 *     summary: Get upload job status
 *     security:
 *       - bearerAuth: []
 *     tags: [Files]
 *     parameters:
 *       - in: path
 *         name: jobId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Upload job status
 */

// File Upload Routes
router.post('/upload', 
  authenticate, 
  upload.array('files', 5), // Handle multiple files, max 5
  handleMulterError, // Handle multer-specific errors
  fileController.uploadFiles
);
router.get('/status/:jobId', authenticate, fileController.getUploadStatus);
router.get('/downloads/:fileId', authenticate, fileController.downloadFile);
router.get('/user-files', authenticate, fileController.getUserFiles);
router.delete('/:fileId', authenticate, fileController.deleteFile);

module.exports = router; 