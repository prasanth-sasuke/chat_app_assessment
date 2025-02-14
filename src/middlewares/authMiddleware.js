const jwt = require('jsonwebtoken');
const { models } = require('../models');
const { Op } = require('sequelize');
const CustomError = require('../utils/customError');
const { unauthorizedResponse } = require('../helpers/apiResponse');

const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      throw new CustomError('No token provided', 401);
    }

    const token = authHeader.split(' ')[1];
    
    // Check if token is blacklisted
    const isBlacklisted = await models.TokenBlacklist.findOne({ 
      where: { 
        token,
        expiresAt: {
          [Op.gt]: new Date()
        }
      } 
    });

    if (isBlacklisted) {
      throw new CustomError('Token has been invalidated', 401);
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    const user = await models.User.findByPk(decoded.id);
    if (!user) {
      throw new CustomError('User not found', 401);
    }

    // Check if token was issued before password was last changed
    if (user.passwordChangedAt && decoded.iat < user.passwordChangedAt.getTime() / 1000) {
      throw new CustomError('Password was changed. Please login again', 401);
    }

    req.user = user;
    req.token = token;
    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return unauthorizedResponse(res, 'Invalid token');
    }
    if (error.name === 'TokenExpiredError') {
      return unauthorizedResponse(res, 'Token has expired');
    }
    return unauthorizedResponse(res, error.message);
  }
};

const isAdmin = async (req, res, next) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Access denied' });
  }
  next();
};

module.exports = {
  authenticate,
  isAdmin
}; 