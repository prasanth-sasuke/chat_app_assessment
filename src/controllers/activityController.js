const { models, Sequelize } = require('../models');
const { Op } = Sequelize;
const { 
  successResponse, 
  errorResponse 
} = require('../helpers/apiResponse');

const getUserActivity = async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 20,
      startDate,
      endDate,
      action 
    } = req.query;

    const offset = (page - 1) * limit;
    const whereClause = {
      userId: req.user.id
    };

    // Add date range filter
    if (startDate && endDate) {
      whereClause.createdAt = {
        [Op.between]: [new Date(startDate), new Date(endDate)]
      };
    }

    // Add action filter if provided
    if (action) {
      whereClause.action = action;
    }

    const activities = await models.ActivityLog.findAndCountAll({
      where: whereClause,
      include: [{
        model: models.User,
        attributes: ['username']
      }],
      order: [['createdAt', 'DESC']],
      limit: parseInt(limit),
      offset: parseInt(offset)
    });

    return successResponse(res, 'Activities retrieved successfully', {
      activities: activities.rows,
      total: activities.count,
      currentPage: parseInt(page),
      totalPages: Math.ceil(activities.count / limit)
    });
  } catch (error) {
    return errorResponse(res, error.message);
  }
};

const getSystemActivity = async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 50,
      startDate,
      endDate,
      action,
      userId 
    } = req.query;

    const offset = (page - 1) * limit;
    const whereClause = {};

    // Add date range filter
    if (startDate && endDate) {
      whereClause.createdAt = {
        [Op.between]: [new Date(startDate), new Date(endDate)]
      };
    }

    // Add action filter
    if (action) {
      whereClause.action = action;
    }

    // Add user filter
    if (userId) {
      whereClause.userId = userId;
    }

    const activities = await models.ActivityLog.findAndCountAll({
      where: whereClause,
      include: [{
        model: models.User,
        attributes: ['id', 'username', 'email']
      }],
      order: [['createdAt', 'DESC']],
      limit: parseInt(limit),
      offset: parseInt(offset)
    });

    return successResponse(res, 'System activities retrieved successfully', {
      activities: activities.rows,
      total: activities.count,
      currentPage: parseInt(page),
      totalPages: Math.ceil(activities.count / limit)
    });
  } catch (error) {
    return errorResponse(res, error.message);
  }
};

const getActivityStats = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    const dateRange = {
      [Op.between]: [
        startDate ? new Date(startDate) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
        endDate ? new Date(endDate) : new Date()
      ]
    };

    // Get activity counts by type
    const actionCounts = await models.ActivityLog.findAll({
      where: {
        createdAt: dateRange
      },
      attributes: [
        'action',
        [Sequelize.fn('COUNT', '*'), 'count']
      ],
      group: ['action']
    });

    // Get activity counts by user
    const userActivityCounts = await models.ActivityLog.findAll({
      where: {
        createdAt: dateRange
      },
      attributes: [
        'userId',
        [Sequelize.fn('COUNT', '*'), 'count']
      ],
      include: [{
        model: models.User,
        attributes: ['username']
      }],
      group: ['userId', 'User.id', 'User.username'],
      order: [[Sequelize.fn('COUNT', '*'), 'DESC']],
      limit: 10
    });

    // Get activity timeline
    const timeline = await models.ActivityLog.findAll({
      where: {
        createdAt: dateRange
      },
      attributes: [
        [Sequelize.fn('date_trunc', 'day', Sequelize.col('createdAt')), 'date'],
        [Sequelize.fn('COUNT', '*'), 'count']
      ],
      group: [Sequelize.fn('date_trunc', 'day', Sequelize.col('createdAt'))],
      order: [[Sequelize.fn('date_trunc', 'day', Sequelize.col('createdAt')), 'ASC']]
    });

    // Get most recent activities
    const recentActivities = await models.ActivityLog.findAll({
      where: {
        createdAt: dateRange
      },
      include: [{
        model: models.User,
        attributes: ['username']
      }],
      order: [['createdAt', 'DESC']],
      limit: 5
    });

    return successResponse(res, 'Activity stats retrieved successfully', {
      actionCounts,
      userActivityCounts,
      timeline,
      recentActivities
    });
  } catch (error) {
    return errorResponse(res, error.message);
  }
};

const createActivityLog = async (userId, action, details = {}) => {
  try {
    const activity = await models.ActivityLog.create({
      userId,
      action,
      details
    });

    return activity;
  } catch (error) {
    console.error('Error creating activity log:', error);
    throw error;
  }
};

const clearOldActivityLogs = async (daysToKeep = 90) => {
  try {
    const cutoffDate = new Date(Date.now() - daysToKeep * 24 * 60 * 60 * 1000);
    
    const deletedCount = await models.ActivityLog.destroy({
      where: {
        createdAt: {
          [Op.lt]: cutoffDate
        }
      }
    });

    return deletedCount;
  } catch (error) {
    console.error('Error clearing old activity logs:', error);
    throw error;
  }
};

module.exports = {
  getUserActivity,
  getSystemActivity,
  getActivityStats,
  createActivityLog,
  clearOldActivityLogs
}; 