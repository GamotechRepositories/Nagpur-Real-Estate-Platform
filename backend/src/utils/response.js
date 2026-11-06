/**
 * Standardized API Response Helpers
 */

const sendSuccess = (res, message = 'Success', data = {}, meta = null, statusCode = 200) => {
  const response = {
    success: true,
    message,
    data,
  };

  if (meta) {
    response.meta = meta;
  }

  return res.status(statusCode).json(response);
};

const sendError = (res, message = 'An error occurred', code = 'INTERNAL_ERROR', details = {}, statusCode = 500) => {
  return res.status(statusCode).json({
    success: false,
    message,
    code,
    details,
  });
};

module.exports = {
  sendSuccess,
  sendError,
};

