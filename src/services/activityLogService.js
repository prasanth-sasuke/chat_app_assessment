const { ActivityLog, User } = require('../models');
const { Op } = require('sequelize');

class ActivityLogService {
  static async logActivity(userId, action, details = {}) {
    return await ActivityLog.create({
      userId,
      action,
      details
    });
  }

  static async getUserActivity(userId, options = {}) {
    const {
      limit = 20,
      offset = 0,
      startDate,
      endDate
    } = options;

    const whereClause = { userId };

    if (startDate && endDate) {
      whereClause.createdAt = {
        [Op.between]: [startDate, endDate]
      };
    }

    return await ActivityLog.findAndCountAll({
      where: whereClause,
      order: [['createdAt', 'DESC']],
      limit,
      offset
    });
  }

  static async getSystemActivity(options = {}) {
    const {
      limit = 50,
      offset = 0,
      action = null
    } = options;

    const whereClause = {};
    if (action) {
      whereClause.action = action;
    }

    return await ActivityLog.findAndCountAll({
      where: whereClause,
      include: [{
        model: User,
        attributes: ['username']
      }],
      order: [['createdAt', 'DESC']],
      limit,
      offset
    });
  }
}

module.exports = ActivityLogService; 