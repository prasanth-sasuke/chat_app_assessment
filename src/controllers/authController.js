const jwt = require('jsonwebtoken');
const { models } = require('../models');
const CustomError = require('../utils/customError');
const { 
  successResponse, 
  createdResponse, 
  errorResponse, 
  unauthorizedResponse 
} = require('../helpers/apiResponse');

const register = async (req, res) => {
  try {
    const { username, email, password } = req.body;
    
    // Check if user already exists
    const existingUser = await models.User.findOne({ where: { email } });
    if (existingUser) {
      throw new CustomError('Email already registered', 400);
    }

    const user = await models.User.create({
      username,
      email,
      password
    });

    await models.ActivityLog.create({
      userId: user.id,
      action: 'REGISTER',
      details: { email }
    });

    return createdResponse(res, 'User registered successfully', {
      user: {
        id: user.id,
        username: user.username,
        email: user.email
      }
    });
  } catch (error) {
    return errorResponse(res, error.message, error.statusCode || 500);
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await models.User.findOne({ where: { email } });

    if (!user) {
      throw new CustomError('Invalid email or password', 401);
    }

    const isValidPassword = await user.validatePassword(password);
    if (!isValidPassword) {
      throw new CustomError('Invalid email or password', 401);
    }

    const token = jwt.sign(
      { 
        id: user.id, 
        email: user.email,
        iat: Math.floor(Date.now() / 1000)
      },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    await models.ActivityLog.create({
      userId: user.id,
      action: 'LOGIN',
      details: { email }
    });

    await user.update({ lastLoginAt: new Date() });

    return successResponse(res, 'Login successful', {
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email
      }
    });
  } catch (error) {
    return errorResponse(res, error.message, error.statusCode || 500);
  }
};

const logout = async (req, res) => {
  try {
    const { user, token } = req;
    
    if (!token) {
      throw new CustomError('No token provided', 400);
    }

    // Blacklist the current token
    await models.TokenBlacklist.create({
      token,
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000)
    });

    await models.ActivityLog.create({
      userId: user.id,
      action: 'LOGOUT'
    });

    await models.User.update(
      { lastSeen: new Date() },
      { where: { id: user.id } }
    );

    return successResponse(res, 'Logged out successfully');
  } catch (error) {
    console.error('Logout error:', error);
    return errorResponse(
      res, 
      error.message || 'Error during logout',
      error.statusCode || 500
    );
  }
};

const getCurrentUser = async (req, res) => {
  try {
    const user = await models.User.findByPk(req.user.id);
    if (!user) {
      throw new CustomError('User not found', 404);
    }

    return successResponse(res, 'User details retrieved successfully', {
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        lastSeen: user.lastSeen,
        lastLoginAt: user.lastLoginAt
      }
    });
  } catch (error) {
    return errorResponse(res, error.message, error.statusCode || 500);
  }
};

const updateProfile = async (req, res) => {
  try {
    const { username } = req.body;
    const user = await models.User.findByPk(req.user.id);

    await user.update({ username });
    
    await models.ActivityLog.create({
      userId: user.id,
      action: 'UPDATE_PROFILE',
      details: { username }
    });

    res.json({
      message: 'Profile updated successfully',
      user: {
        id: user.id,
        username: user.username,
        email: user.email
      }
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

module.exports = {
  register,
  login,
  logout,
  getCurrentUser,
  updateProfile
}; 