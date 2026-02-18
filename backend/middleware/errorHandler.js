/**
 * Professional Error Handling Middleware
 * Provides consistent error responses and logging
 * Production: no stack traces, standard error format
 */

import { validationResult } from 'express-validator';
import { log } from '../utils/logger.js';

// Custom error class for application errors
export class AppError extends Error {
  constructor(message, statusCode = 500, isOperational = true, errorCode = 'ERROR') {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = isOperational;
    this.errorCode = errorCode;
    this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
    Error.captureStackTrace(this, this.constructor);
  }
}

// Validation error handler
export const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const errorMessages = errors.array().map(error => ({
      field: error.path || error.param,
      message: error.msg,
      value: error.value
    }));
    
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errorMessages
    });
  }
  next();
};

// Async error wrapper
export const asyncHandler = (fn) => {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

// MongoDB duplicate key error
const handleDuplicateKeyError = (err) => {
  const field = Object.keys(err.keyValue)[0];
  const value = err.keyValue[field];
  const message = `${field} '${value}' already exists. Please use a different ${field}.`;
  const error = new AppError(message, 400);
  error.errorCode = 'DUPLICATE_KEY';
  return error;
};

// MongoDB validation error
const handleValidationError = (err) => {
  const errors = Object.values(err.errors).map(val => val.message);
  const message = `Invalid input data. ${errors.join('. ')}`;
  const error = new AppError(message, 400);
  error.errorCode = 'VALIDATION_ERROR';
  return error;
};

// MongoDB cast error
const handleCastError = (err) => {
  const message = `Invalid ${err.path}: ${err.value}`;
  const error = new AppError(message, 400);
  error.errorCode = 'INVALID_ID';
  return error;
};

// JWT error
const handleJWTError = () => {
  const error = new AppError('Invalid token. Please log in again.', 401);
  error.errorCode = 'INVALID_TOKEN';
  return error;
};

// JWT expired error
const handleJWTExpiredError = () => {
  const error = new AppError('Your token has expired. Please log in again.', 401);
  error.errorCode = 'TOKEN_EXPIRED';
  return error;
};

// Standard error format for all responses
const errorFormat = (message, errorCode = 'INTERNAL_ERROR') => ({
  success: false,
  message,
  errorCode,
});

// Send error response in development
const sendErrorDev = (err, res) => {
  res.status(err.statusCode).json({
    ...errorFormat(err.message, err.errorCode || 'ERROR'),
    stack: err.stack,
  });
};

// Send error response in production - no stack traces
const sendErrorProd = (err, res) => {
  if (err.isOperational) {
    res.status(err.statusCode).json(
      errorFormat(err.message, err.errorCode || 'ERROR')
    );
  } else {
    log.error('Unhandled error', { message: err.message });
    res.status(500).json(
      errorFormat('Something went wrong', 'INTERNAL_ERROR')
    );
  }
};

// Global error handling middleware
export const globalErrorHandler = (err, req, res, next) => {
  if (res.headersSent) return next(err);
  const isCors = err.message === 'Not allowed by CORS';
  err.statusCode = err.statusCode || (isCors ? 403 : 500);
  err.status = err.status || 'error';
  if (isCors) {
    err.message = 'CORS policy: origin not allowed';
    err.errorCode = 'CORS_NOT_ALLOWED';
  }

  if (process.env.NODE_ENV === 'development') {
    sendErrorDev(err, res);
  } else {
    let error = { ...err };
    error.message = err.message;

    // Handle specific error types
    if (error.code === 11000) error = handleDuplicateKeyError(error);
    if (error.name === 'ValidationError') error = handleValidationError(error);
    if (error.name === 'CastError') error = handleCastError(error);
    if (error.name === 'JsonWebTokenError') error = handleJWTError();
    if (error.name === 'TokenExpiredError') error = handleJWTExpiredError();

    sendErrorProd(error, res);
  }
};

// 404 handler for undefined routes
export const notFoundHandler = (req, res, next) => {
  const isProduction = process.env.NODE_ENV === 'production';
  if (req.originalUrl.startsWith('/api')) {
    return res.status(404).json({
      success: false,
      message: 'Route not found',
      errorCode: 'NOT_FOUND',
      ...(isProduction ? {} : { path: req.originalUrl, method: req.method }),
    });
  }
  const err = new AppError(`Can't find ${req.originalUrl} on this server!`, 404);
  err.errorCode = 'NOT_FOUND';
  next(err);
};

// Request logging middleware - minimal in production
export const requestLogger = (req, res, next) => {
  // Only log in development or for errors
  if (process.env.NODE_ENV === 'development') {
    const start = Date.now();
    res.on('finish', () => {
      const duration = Date.now() - start;
      if (res.statusCode >= 400) {
        // Error response (logging disabled for production)
      }
    });
  }
  
  next();
};

export default {
  AppError,
  handleValidationErrors,
  asyncHandler,
  globalErrorHandler,
  notFoundHandler,
  requestLogger
};