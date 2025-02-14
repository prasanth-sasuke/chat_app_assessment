const express = require('express');
const router = express.Router();
const messageController = require('../controllers/messageController');
const { authenticate } = require('../middlewares/authMiddleware');
const { validateMessage } = require('../middlewares/validation');

// Message Routes
router.post('/', authenticate, validateMessage, messageController.sendMessage);
router.get('/', authenticate, messageController.getMessages);
router.get('/history', authenticate, messageController.getMessageHistory);
router.get('/search', authenticate, messageController.searchMessages);
router.delete('/:messageId', authenticate, messageController.deleteMessage);
router.put('/:messageId', authenticate, validateMessage, messageController.editMessage);

/**
 * @swagger
 * components:
 *   schemas:
 *     Message:
 *       type: object
 *       required:
 *         - content
 *         - senderId
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *         content:
 *           type: string
 *         type:
 *           type: string
 *           enum: [text, file]
 *         fileUrl:
 *           type: string
 *         senderId:
 *           type: string
 *           format: uuid
 *         createdAt:
 *           type: string
 *           format: date-time
 */

/**
 * @swagger
 * /messages:
 *   post:
 *     summary: Send a new message
 *     security:
 *       - bearerAuth: []
 *     tags: [Messages]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - content
 *             properties:
 *               content:
 *                 type: string
 *               type:
 *                 type: string
 *                 enum: [text, file]
 *               fileUrl:
 *                 type: string
 *     responses:
 *       201:
 *         description: Message sent successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Message'
 */

/**
 * @swagger
 * /messages:
 *   get:
 *     summary: Get message history
 *     security:
 *       - bearerAuth: []
 *     tags: [Messages]
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 50
 *       - in: query
 *         name: offset
 *         schema:
 *           type: integer
 *           default: 0
 *     responses:
 *       200:
 *         description: List of messages
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 rows:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Message'
 *                 count:
 *                   type: integer
 */

module.exports = router; 