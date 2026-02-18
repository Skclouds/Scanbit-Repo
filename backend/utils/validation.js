import mongoose from 'mongoose';


/**
 * Validate if a string is a valid MongoDB ObjectId
 * @param {string} id - The ID to validate
 * @returns {boolean} - True if valid ObjectId
 */
export const isValidObjectId = (id) => {
  return mongoose.Types.ObjectId.isValid(id);
};

/**
 * Sanitize NoSQL injection attempts
 * @param {any} obj - Object to sanitize
 * @returns {any} - Sanitized object
 */
export const sanitizeInput = (obj) => {
  if (typeof obj !== 'object' || obj === null) {
    return obj;
  }

  const sanitized = Array.isArray(obj) ? [] : {};

  for (const key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      // Remove $ and . from keys to prevent NoSQL injection
      const cleanKey = key.replace(/^\$/, '').replace(/\./g, '_');
      const value = obj[key];

      if (typeof value === 'string') {
        // Remove $ from string values
        sanitized[cleanKey] = value.replace(/^\$/g, '');
      } else if (typeof value === 'object' && value !== null) {
        sanitized[cleanKey] = sanitizeInput(value);
      } else {
        sanitized[cleanKey] = value;
      }
    }
  }

  return sanitized;
};

/**
 * Validate email format
 * @param {string} email - Email to validate
 * @returns {boolean} - True if valid email
 */
export const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Validate phone number format
 * @param {string} phone - Phone number to validate
 * @returns {boolean} - True if valid phone
 */
export const isValidPhone = (phone) => {
  const phoneRegex = /^[0-9]{10,15}$/;
  return phoneRegex.test(phone.replace(/\D/g, ''));
};

/**
 * Validate pagination parameters
 * @param {number} page - Page number
 * @param {number} limit - Items per page
 * @returns {object} - Validated pagination object
 */
export const validatePagination = (page = 1, limit = 10) => {
  let validPage = Math.max(1, parseInt(page) || 1);
  let validLimit = Math.min(Math.max(1, parseInt(limit) || 10), 100); // Max 100 items

  return {
    page: validPage,
    limit: validLimit,
    skip: (validPage - 1) * validLimit
  };
};

/**
 * Validate sort parameters
 * @param {string} sortBy - Field to sort by
 * @param {string} sortOrder - 'asc' or 'desc'
 * @param {array} allowedFields - Allowed fields to sort by
 * @returns {object} - Validated sort object
 */
export const validateSort = (sortBy, sortOrder, allowedFields = []) => {
  const validSortOrder = sortOrder === 'desc' ? -1 : 1;
  
  if (allowedFields.length > 0 && !allowedFields.includes(sortBy)) {
    return { createdAt: -1 };
  }

  return { [sortBy || 'createdAt']: validSortOrder };
};

/**
 * Create pagination response
 * @param {number} total - Total number of items
 * @param {number} page - Current page
 * @param {number} limit - Items per page
 * @returns {object} - Pagination metadata
 */
export const getPaginationMeta = (total, page, limit) => {
  const totalPages = Math.ceil(total / limit);
  return {
    page: parseInt(page),
    limit: parseInt(limit),
    total,
    totalPages,
    hasNextPage: page < totalPages,
    hasPrevPage: page > 1
  };
};

export default {
  isValidObjectId,
  sanitizeInput,
  isValidEmail,
  isValidPhone,
  validatePagination,
  validateSort,
  getPaginationMeta
};
