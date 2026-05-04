import logger from '../utils/logger.js';

const errorHandler = (err, req, res, _next) => {
  // If a controller already set a non-200 status, respect it. Otherwise 500.
  const status = res.statusCode && res.statusCode !== 200 ? res.statusCode : (err.status || 500);

  logger.error(
    { err: err.message, stack: err.stack, reqId: req.id, path: req.originalUrl, method: req.method },
    'request.error',
  );

  res.status(status).json({
    message: err.message || 'Internal server error',
    requestId: req.id,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
};

export default errorHandler;
