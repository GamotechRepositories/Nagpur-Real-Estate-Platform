const { sendError } = require('../utils/response');

const notFoundHandler = (req, res, next) => {
  return sendError(
    res,
    `Cannot ${req.method} ${req.originalUrl} - Route not found on Nagpur Real Estate API`,
    'ROUTE_NOT_FOUND',
    {},
    404
  );
};

const errorHandler = (err, req, res, next) => {
  let statusCode = err.statusCode || 500;
  let message = err.message || 'Internal Server Error';
  let code = err.code || 'SERVER_ERROR';
  let details = err.details || {};

  // Mongoose Bad ObjectId (CastError)
  if (err.name === 'CastError') {
    statusCode = 400;
    message = `Invalid ${err.path}: ${err.value}`;
    code = 'INVALID_IDENTIFIER';
  }

  // Mongoose Validation Error
  if (err.name === 'ValidationError') {
    statusCode = 400;
    message = 'Validation failed for one or more fields.';
    code = 'VALIDATION_ERROR';
    details = Object.values(err.errors).reduce((acc, curr) => {
      acc[curr.path] = curr.message;
      return acc;
    }, {});
  }

  // Mongoose Duplicate Key Error (code 11000)
  if (err.code === 11000) {
    statusCode = 409;
    const field = Object.keys(err.keyValue || {})[0] || 'field';
    message = `A record with this ${field} already exists.`;
    code = 'DUPLICATE_ENTRY';
    details = err.keyValue;
  }

  // Zod Validation Error
  if (err.issues && Array.isArray(err.issues)) {
    statusCode = 400;
    message = 'Request validation failed.';
    code = 'SCHEMA_VALIDATION_ERROR';
    details = err.issues.map((i) => ({
      path: i.path.join('.'),
      message: i.message,
    }));
  }

  // Log server errors in console for debugging
  if (statusCode >= 500) {
    console.error('[Unhandled Server Error]:', err);
  }

  const responsePayload = {
    success: false,
    message,
    code,
    details,
  };

  // Only include stack in development mode
  if (process.env.NODE_ENV === 'development') {
    responsePayload.stack = err.stack;
  }

  return res.status(statusCode).json(responsePayload);
};

module.exports = {
  notFoundHandler,
  errorHandler,
};

