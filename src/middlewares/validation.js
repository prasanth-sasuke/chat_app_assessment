const { body, validationResult } = require('express-validator');
const Joi = require('joi');

// Joi Schemas
const schemas = {
  register: Joi.object({
    username: Joi.string().min(3).max(30).required(),
    email: Joi.string().email().required(),
    password: Joi.string().min(6).required()
  }),

  login: Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().required()
  }),

  message: Joi.object({
    content: Joi.string().trim().min(1).required(),
    type: Joi.string().valid('text', 'file').default('text'),
    fileUrl: Joi.string().uri().allow(null)
  })
};

// Express-validator middleware
const validateRegistration = [
  body('username')
    .trim()
    .isLength({ min: 3 })
    .withMessage('Username must be at least 3 characters long'),
  body('email')
    .isEmail()
    .withMessage('Must be a valid email address'),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long'),
  handleValidationErrors
];

const validateLoginFields = [
  body('email')
    .isEmail()
    .withMessage('Must be a valid email address'),
  body('password')
    .notEmpty()
    .withMessage('Password is required'),
  handleValidationErrors
];

const validateMessageFields = [
  body('content')
    .trim()
    .notEmpty()
    .withMessage('Message content cannot be empty'),
  handleValidationErrors
];

// Helper function to handle validation errors
function handleValidationErrors(req, res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
}

// Joi validation middleware
const validateWithJoi = (schema) => {
  return (req, res, next) => {
    const { error } = schema.validate(req.body);
    if (error) {
      return res.status(400).json({ 
        success: false,
        error: error.details[0].message 
      });
    }
    next();
  };
};

const validateFileUpload = [
  (req, res, next) => {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ 
        success: false,
        error: 'No files uploaded' 
      });
    }
    next();
  }
];

module.exports = {
  // Express-validator middleware
  validateRegistration,
  validateLoginFields,
  validateMessageFields,
  validateFileUpload,
  
  // Joi validation middleware
  validateRegister: validateWithJoi(schemas.register),
  validateLogin: validateWithJoi(schemas.login),
  validateMessage: validateWithJoi(schemas.message)
}; 