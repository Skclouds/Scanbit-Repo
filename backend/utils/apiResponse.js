/**
 * Professional API Response Utilities
 * Provides consistent response formatting across all endpoints
 */

import { paginationMeta } from './pagination.js';

// Success response with data
export const successResponse = (res, data, message = 'Success', statusCode = 200) => {
  return res.status(statusCode).json({
    success: true,
    message,
    data,
    timestamp: new Date().toISOString()
  });
};

// Success response with pagination (uses paginationMeta for consistency)
export const successResponseWithPagination = (res, data, pagination, message = 'Success', statusCode = 200) => {
  const meta = paginationMeta(
    pagination.total,
    pagination.page,
    pagination.limit
  );
  return res.status(statusCode).json({
    success: true,
    message,
    data,
    pagination: meta,
    timestamp: new Date().toISOString()
  });
};

// Error response
export const errorResponse = (res, message = 'Internal Server Error', statusCode = 500, errors = null) => {
  const response = {
    success: false,
    message,
    timestamp: new Date().toISOString()
  };
  
  if (errors) {
    response.errors = errors;
  }
  
  return res.status(statusCode).json(response);
};

// Validation error response
export const validationErrorResponse = (res, errors, message = 'Validation failed') => {
  return res.status(400).json({
    success: false,
    message,
    errors: errors.map(error => ({
      field: error.path || error.param,
      message: error.msg,
      value: error.value
    })),
    timestamp: new Date().toISOString()
  });
};

// Not found response
export const notFoundResponse = (res, resource = 'Resource') => {
  return res.status(404).json({
    success: false,
    message: `${resource} not found`,
    timestamp: new Date().toISOString()
  });
};

// Unauthorized response
export const unauthorizedResponse = (res, message = 'Unauthorized access') => {
  return res.status(401).json({
    success: false,
    message,
    timestamp: new Date().toISOString()
  });
};

// Forbidden response
export const forbiddenResponse = (res, message = 'Access forbidden') => {
  return res.status(403).json({
    success: false,
    message,
    timestamp: new Date().toISOString()
  });
};

// Created response
export const createdResponse = (res, data, message = 'Created successfully') => {
  return res.status(201).json({
    success: true,
    message,
    data,
    timestamp: new Date().toISOString()
  });
};

// No content response
export const noContentResponse = (res) => {
  return res.status(204).send();
};

// Conflict response
export const conflictResponse = (res, message = 'Resource already exists') => {
  return res.status(409).json({
    success: false,
    message,
    timestamp: new Date().toISOString()
  });
};

// Too many requests response
export const tooManyRequestsResponse = (res, message = 'Too many requests') => {
  return res.status(429).json({
    success: false,
    message,
    timestamp: new Date().toISOString()
  });
};

// Service unavailable response
export const serviceUnavailableResponse = (res, message = 'Service temporarily unavailable') => {
  return res.status(503).json({
    success: false,
    message,
    timestamp: new Date().toISOString()
  });
};

export default {
  successResponse,
  successResponseWithPagination,
  errorResponse,
  validationErrorResponse,
  notFoundResponse,
  unauthorizedResponse,
  forbiddenResponse,
  createdResponse,
  noContentResponse,
  conflictResponse,
  tooManyRequestsResponse,
  serviceUnavailableResponse
};