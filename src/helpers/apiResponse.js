/**
 * Standard API Response Helper
 */

// Success Responses
const successResponse = (res, msg, data = null, code = 200) => {
  const response = {
    success: true,
    message: msg
  };
  if (data) response.data = data;
  return res.status(code).json(response);
};

const createdResponse = (res, msg, data = null) => {
  return successResponse(res, msg, data, 201);
};

// Error Responses
const errorResponse = (res, msg, code = 500) => {
  return res.status(code).json({
    success: false,
    error: msg
  });
};

const validationError = (res, errors) => {
  return res.status(400).json({
    success: false,
    error: 'Validation Error',
    errors: errors
  });
};

const unauthorizedResponse = (res, msg = 'Unauthorized') => {
  return res.status(401).json({
    success: false,
    error: msg
  });
};

const forbiddenResponse = (res, msg = 'Forbidden') => {
  return res.status(403).json({
    success: false,
    error: msg
  });
};

const notFoundResponse = (res, msg = 'Not Found') => {
  return res.status(404).json({
    success: false,
    error: msg
  });
};

module.exports = {
  successResponse,
  createdResponse,
  errorResponse,
  validationError,
  unauthorizedResponse,
  forbiddenResponse,
  notFoundResponse 
};
  