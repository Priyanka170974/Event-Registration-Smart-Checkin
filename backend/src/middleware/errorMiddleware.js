import mongoose from 'mongoose';
import { ApiError } from '../utils/ApiError.js';

export function notFound(req, _res, next) {
  next(new ApiError(404, `Route ${req.method} ${req.originalUrl} was not found.`, 'ROUTE_NOT_FOUND'));
}

export function errorHandler(error, _req, res, _next) {
  let statusCode = error.statusCode || 500;
  let message = error.message || 'An unexpected error occurred.';
  let code = error.code || 'INTERNAL_ERROR';
  let details = error.details;

  if (error?.type === 'entity.parse.failed') {
    statusCode = 400;
    code = 'INVALID_JSON';
    message = 'The request body is not valid JSON.';
  }

  if (error instanceof mongoose.Error.CastError) {
    statusCode = 400;
    code = 'INVALID_IDENTIFIER';
    message = 'The supplied identifier is invalid.';
  } else if (error instanceof mongoose.Error.ValidationError) {
    statusCode = 400;
    code = 'DATABASE_VALIDATION_ERROR';
    message = Object.values(error.errors)[0]?.message || 'The submitted data is invalid.';
  } else if (error?.code === 11000) {
    statusCode = 409;
    code = 'DUPLICATE_RESOURCE';
    message = 'A record with these details already exists.';
  }

 if (statusCode >= 500) {
  console.error('FULL SERVER ERROR:', error);
}

  if (statusCode >= 500 && !error.isOperational) {
    message = 'An unexpected server error occurred.';
    code = 'INTERNAL_ERROR';
    details = undefined;
  }

  res.status(statusCode).json({
    success: false,
    code,
    message,
    ...(details ? { details } : {}),
    ...(process.env.NODE_ENV === 'development' && statusCode >= 500
      ? { stack: error.stack }
      : {}),
  });
}
