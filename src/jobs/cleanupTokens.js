const { TokenBlacklist } = require('../models');
const { Op } = require('sequelize');

const cleanupExpiredTokens = async () => {
  try {
    await TokenBlacklist.destroy({
      where: {
        expiresAt: {
          [Op.lt]: new Date()
        }
      }
    });
  } catch (error) {
    console.error('Error cleaning up expired tokens:', error);
  }
};

// Run cleanup daily
setInterval(cleanupExpiredTokens, 24 * 60 * 60 * 1000);

module.exports = cleanupExpiredTokens; 