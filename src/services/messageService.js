const { Message, User } = require('../models');
const { Op } = require('sequelize');

const createMessage = async (senderId, content, type = 'text', fileUrl = null) => {
  return await Message.create({
    senderId,
    content,
    type,
    fileUrl
  });
};

const getMessageHistory = async (options = {}) => {
  const {
    limit = 50,
    offset = 0,
    beforeId = null,
    afterId = null
  } = options;

  const whereClause = {};
  if (beforeId) whereClause.id = { [Op.lt]: beforeId };
  if (afterId) whereClause.id = { [Op.gt]: afterId };

  return await Message.findAndCountAll({
    where: whereClause,
    include: [{
      model: User,
      as: 'sender',
      attributes: ['id', 'username']
    }],
    order: [['createdAt', 'DESC']],
    limit,
    offset
  });
};

const searchMessages = async (searchTerm, options = {}) => {
  const {
    limit = 20,
    offset = 0
  } = options;

  return await Message.findAndCountAll({
    where: {
      content: {
        [Op.iLike]: `%${searchTerm}%`
      }
    },
    include: [{
      model: User,
      as: 'sender',
      attributes: ['id', 'username']
    }],
    order: [['createdAt', 'DESC']],
    limit,
    offset
  });
};

const getMessage = async (messageId) => {
  return await Message.findOne({
    where: { id: messageId },
    include: [{
      model: User,
      as: 'sender',
      attributes: ['id', 'username']
    }]
  });
};

const deleteMessage = async (messageId) => {
  return await Message.destroy({
    where: { id: messageId }
  });
};

const updateMessage = async (messageId, content) => {
  return await Message.update(
    { content },
    { where: { id: messageId } }
  );
};

const getMessagesByUser = async (userId, options = {}) => {
  const {
    limit = 20,
    offset = 0
  } = options;

  return await Message.findAndCountAll({
    where: { senderId: userId },
    include: [{
      model: User,
      as: 'sender',
      attributes: ['id', 'username']
    }],
    order: [['createdAt', 'DESC']],
    limit,
    offset
  });
};

const getUnreadMessages = async (userId, lastReadTimestamp) => {
  return await Message.findAll({
    where: {
      createdAt: {
        [Op.gt]: lastReadTimestamp
      },
      senderId: {
        [Op.ne]: userId
      }
    },
    include: [{
      model: User,
      as: 'sender',
      attributes: ['id', 'username']
    }],
    order: [['createdAt', 'ASC']]
  });
};

module.exports = {
  createMessage,
  getMessageHistory,
  searchMessages,
  getMessage,
  deleteMessage,
  updateMessage,
  getMessagesByUser,
  getUnreadMessages
}; 