const { models, Sequelize } = require('../models');
const socketService = require('../services/socketService');
const CustomError = require('../utils/customError');
const { Op } = Sequelize;
const { 
  successResponse, 
  createdResponse, 
  errorResponse, 
  notFoundResponse,
  forbiddenResponse 
} = require('../helpers/apiResponse');

const sendMessage = async (req, res) => {
  try {
    const { content, type = 'text', fileUrl = null } = req.body;
    const senderId = req.user.id;

    const message = await models.Message.create({
      content,
      type,
      fileUrl,
      senderId
    });

    await models.ActivityLog.create({
      userId: senderId,
      action: 'SEND_MESSAGE',
      details: { messageId: message.id }
    });

    const io = socketService.getIO();
    io.emit('new_message', {
      message,
      sender: {
        id: req.user.id,
        username: req.user.username
      }
    });

    return createdResponse(res, 'Message sent successfully', { message });
  } catch (error) {
    return errorResponse(res, error.message, error.statusCode || 500);
  }
};

const getMessages = async (req, res) => {
  try {
    const { limit = 50, offset = 0 } = req.query;

    const messages = await models.Message.findAndCountAll({
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['createdAt', 'DESC']],
      include: [{
        model: models.User,
        as: 'sender',
        attributes: ['id', 'username', 'email']
      }]
    });

    return successResponse(res, 'Messages retrieved successfully', messages);
  } catch (error) {
    return errorResponse(res, error.message);
  }
};

const getMessageHistory = async (req, res) => {
  try {
    const { beforeId, afterId, limit = 50 } = req.query;
    const messages = await models.Message.findAll({
      where: {
        id: {
          [Op.between]: [beforeId, afterId]
        }
      },
      limit: parseInt(limit),
      include: [{
        model: models.User,
        as: 'sender',
        attributes: ['id', 'username', 'email']
      }],
      order: [['createdAt', 'DESC']]
    });

    return successResponse(res, 'Message history retrieved', messages);
  } catch (error) {
    return errorResponse(res, error.message);
  }
};

const searchMessages = async (req, res) => {
  try {
    const { query, limit = 20, offset = 0 } = req.query;
    
    if (!query) {
      return res.status(400).json({ error: 'Search query is required' });
    }

    const messages = await models.Message.findAll({
      where: {
        content: {
          [Op.like]: `%${query}%`
        }
      },
      limit: parseInt(limit),
      offset: parseInt(offset)
    });

    return successResponse(res, 'Messages found', messages);
  } catch (error) {
    return errorResponse(res, error.message);
  }
};

const deleteMessage = async (req, res) => {
  try {
    const { messageId } = req.params;
    const message = await models.Message.findByPk(messageId);

    if (!message) {
      throw new CustomError('Message not found', 404);
    }

    if (message.senderId !== req.user.id) {
      throw new CustomError('Not authorized to delete this message', 403);
    }

    await message.destroy();
    
    await models.ActivityLog.create({
      userId: req.user.id,
      action: 'DELETE_MESSAGE',
      details: { messageId }
    });

    const io = socketService.getIO();
    io.emit('message_deleted', { messageId });
    return successResponse(res, 'Message deleted successfully');
  } catch (error) {
    return errorResponse(res, error.message, error.statusCode || 500);
  }
};

const editMessage = async (req, res) => {
  try {
    const { messageId } = req.params;
    const { content } = req.body;
    
    const message = await models.Message.findByPk(messageId);
    
    if (!message) {
      throw new CustomError('Message not found', 404);
    }

    if (message.senderId !== req.user.id) {
      throw new CustomError('Not authorized to edit this message', 403);
    }

    await message.update({ content });
    
    await models.ActivityLog.create({
      userId: req.user.id,
      action: 'EDIT_MESSAGE',
      details: { messageId, newContent: content }
    });

    const io = socketService.getIO();
    io.emit('message_edited', {
      messageId,
      content,
      editedAt: new Date()
    });

    return successResponse(res, 'Message updated successfully');
  } catch (error) {
    return errorResponse(res, error.message, error.statusCode || 500);
  }
};

const setTypingStatus = async (req, res) => {
  try {
    const { isTyping } = req.body;
    
    const io = socketService.getIO();
    io.emit('typing_status', {
      userId: req.user.id,
      username: req.user.username,
      isTyping
    });

    return successResponse(res, 'Typing status updated');
  } catch (error) {
    return errorResponse(res, error.message);
  }
};

module.exports = {
  sendMessage,
  getMessages,
  getMessageHistory,
  searchMessages,
  deleteMessage,
  editMessage,
  setTypingStatus
}; 