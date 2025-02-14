const { User, Message, ActivityLog } = require('../models');
const { Op } = require('sequelize');
const sequelize = require('../config/database');

class UserService {
  static async getUserWithStats(userId) {
    const user = await User.findByPk(userId, {
      attributes: {
        include: [
          [
            sequelize.literal(`(
              SELECT COUNT(*)
              FROM "Messages"
              WHERE "senderId" = "User"."id"
            )`),
            'messageCount'
          ],
          [
            sequelize.literal(`(
              SELECT COUNT(*)
              FROM "ActivityLogs"
              WHERE "userId" = "User"."id"
            )`),
            'activityCount'
          ]
        ]
      }
    });
    return user;
  }

  static async getActiveUsers(hours = 24) {
    const activeUsers = await User.findAll({
      where: {
        lastSeen: {
          [Op.gte]: new Date(Date.now() - hours * 60 * 60 * 1000)
        }
      },
      attributes: ['id', 'username', 'lastSeen']
    });
    return activeUsers;
  }

  static async getUserMessageStats(userId, timeRange = 'week') {
    const timeRanges = {
      day: 1,
      week: 7,
      month: 30
    };

    const days = timeRanges[timeRange] || 7;

    const stats = await Message.findAll({
      where: {
        senderId: userId,
        createdAt: {
          [Op.gte]: new Date(Date.now() - days * 24 * 60 * 60 * 1000)
        }
      },
      attributes: [
        [sequelize.fn('date_trunc', 'day', sequelize.col('createdAt')), 'date'],
        [sequelize.fn('count', '*'), 'count']
      ],
      group: [sequelize.fn('date_trunc', 'day', sequelize.col('createdAt'))],
      order: [[sequelize.fn('date_trunc', 'day', sequelize.col('createdAt')), 'ASC']]
    });

    return stats;
  }
}

module.exports = UserService; 