/**
 * Professional Validation Utilities
 * Provides consistent validation rules across all endpoints
 */

import { body, param, query } from 'express-validator';

// Common validation rules
export const commonValidations = {
  // Email validation
  email: body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email address'),
  
  // Password validation
  password: body('password')
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters long')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
    .withMessage('Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character'),
  
  // Name validation
  name: body('name')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Name must be between 2 and 50 characters')
    .matches(/^[a-zA-Z\s]+$/)
    .withMessage('Name can only contain letters and spaces'),
  
  // Phone validation
  phone: body('phone')
    .optional()
    .isMobilePhone('any')
    .withMessage('Please provide a valid phone number'),
  
  // MongoDB ObjectId validation
  mongoId: param('id')
    .isMongoId()
    .withMessage('Invalid ID format'),
  
  // Pagination validation
  page: query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),
  
  limit: query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100'),
  
  // Search validation
  search: query('search')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('Search query must not exceed 100 characters'),
  
  // Sort validation
  sortBy: query('sortBy')
    .optional()
    .isIn(['createdAt', 'updatedAt', 'name', 'email', 'businessName'])
    .withMessage('Invalid sort field'),
  
  sortOrder: query('sortOrder')
    .optional()
    .isIn(['asc', 'desc'])
    .withMessage('Sort order must be asc or desc')
};

// User validation rules
export const userValidations = {
  register: [
    commonValidations.name,
    commonValidations.email,
    commonValidations.password,
    body('businessName')
      .trim()
      .isLength({ min: 2, max: 100 })
      .withMessage('Business name must be between 2 and 100 characters'),
    body('businessType')
      .trim()
      .isLength({ min: 2, max: 50 })
      .withMessage('Business type is required'),
    commonValidations.phone
  ],
  
  login: [
    commonValidations.email,
    body('password')
      .notEmpty()
      .withMessage('Password is required')
  ],
  
  updateProfile: [
    body('name')
      .optional()
      .trim()
      .isLength({ min: 2, max: 50 })
      .withMessage('Name must be between 2 and 50 characters'),
    body('phone')
      .optional()
      .isMobilePhone('any')
      .withMessage('Please provide a valid phone number'),
    body('bio')
      .optional()
      .trim()
      .isLength({ max: 500 })
      .withMessage('Bio must not exceed 500 characters')
  ]
};

// Restaurant validation rules
export const restaurantValidations = {
  create: [
    body('businessName')
      .trim()
      .isLength({ min: 2, max: 100 })
      .withMessage('Business name must be between 2 and 100 characters'),
    body('businessType')
      .trim()
      .isLength({ min: 2, max: 50 })
      .withMessage('Business type is required'),
    body('businessCategory')
      .optional()
      .trim()
      .isLength({ min: 2, max: 50 })
      .withMessage('Business category must be between 2 and 50 characters'),
    body('description')
      .optional()
      .trim()
      .isLength({ max: 1000 })
      .withMessage('Description must not exceed 1000 characters'),
    body('address.street')
      .optional()
      .trim()
      .isLength({ max: 200 })
      .withMessage('Street address must not exceed 200 characters'),
    body('address.city')
      .optional()
      .trim()
      .isLength({ max: 50 })
      .withMessage('City must not exceed 50 characters'),
    body('address.state')
      .optional()
      .trim()
      .isLength({ max: 50 })
      .withMessage('State must not exceed 50 characters'),
    body('address.zipCode')
      .optional()
      .trim()
      .isLength({ max: 20 })
      .withMessage('Zip code must not exceed 20 characters'),
    body('address.country')
      .optional()
      .trim()
      .isLength({ max: 50 })
      .withMessage('Country must not exceed 50 characters')
  ],
  
  update: [
    commonValidations.mongoId,
    body('businessName')
      .optional()
      .trim()
      .isLength({ min: 2, max: 100 })
      .withMessage('Business name must be between 2 and 100 characters'),
    body('description')
      .optional()
      .trim()
      .isLength({ max: 1000 })
      .withMessage('Description must not exceed 1000 characters')
  ]
};

// Category validation rules
export const categoryValidations = {
  create: [
    body('name')
      .trim()
      .isLength({ min: 1, max: 50 })
      .withMessage('Category name must be between 1 and 50 characters'),
    body('description')
      .optional()
      .trim()
      .isLength({ max: 200 })
      .withMessage('Description must not exceed 200 characters'),
    body('emoji')
      .optional()
      .trim()
      .isLength({ max: 10 })
      .withMessage('Emoji must not exceed 10 characters')
  ],
  
  update: [
    commonValidations.mongoId,
    body('name')
      .optional()
      .trim()
      .isLength({ min: 1, max: 50 })
      .withMessage('Category name must be between 1 and 50 characters'),
    body('description')
      .optional()
      .trim()
      .isLength({ max: 200 })
      .withMessage('Description must not exceed 200 characters')
  ]
};

// Menu item validation rules
export const menuItemValidations = {
  create: [
    body('name')
      .trim()
      .isLength({ min: 1, max: 100 })
      .withMessage('Item name must be between 1 and 100 characters'),
    body('description')
      .optional()
      .trim()
      .isLength({ max: 500 })
      .withMessage('Description must not exceed 500 characters'),
    body('price')
      .isFloat({ min: 0 })
      .withMessage('Price must be a positive number'),
    body('categoryId')
      .isMongoId()
      .withMessage('Invalid category ID'),
    body('isVeg')
      .optional()
      .isBoolean()
      .withMessage('isVeg must be a boolean'),
    body('isSpicy')
      .optional()
      .isBoolean()
      .withMessage('isSpicy must be a boolean'),
    body('available')
      .optional()
      .isBoolean()
      .withMessage('available must be a boolean')
  ],
  
  update: [
    commonValidations.mongoId,
    body('name')
      .optional()
      .trim()
      .isLength({ min: 1, max: 100 })
      .withMessage('Item name must be between 1 and 100 characters'),
    body('price')
      .optional()
      .isFloat({ min: 0 })
      .withMessage('Price must be a positive number')
  ]
};

// Admin validation rules
export const adminValidations = {
  createUser: [
    commonValidations.name,
    commonValidations.email,
    commonValidations.password,
    body('businessName')
      .trim()
      .isLength({ min: 2, max: 100 })
      .withMessage('Business name must be between 2 and 100 characters'),
    body('businessType')
      .trim()
      .isLength({ min: 2, max: 50 })
      .withMessage('Business type is required'),
    commonValidations.phone
  ],
  
  updateUser: [
    commonValidations.mongoId,
    body('isActive')
      .optional()
      .isBoolean()
      .withMessage('isActive must be a boolean'),
    body('role')
      .optional()
      .isIn(['admin', 'user'])
      .withMessage('Role must be admin or user'),
    body('name')
      .optional()
      .trim()
      .isLength({ min: 2, max: 50 })
      .withMessage('Name must be between 2 and 50 characters')
  ]
};

// OTP validation rules
export const otpValidations = {
  send: [
    commonValidations.email,
    body('type')
      .optional()
      .isIn(['registration', 'login', 'password-reset'])
      .withMessage('Invalid OTP type')
  ],
  
  verify: [
    commonValidations.email,
    body('otp')
      .isLength({ min: 6, max: 6 })
      .isNumeric()
      .withMessage('OTP must be a 6-digit number')
  ]
};

// Payment validation rules
export const paymentValidations = {
  createOrder: [
    body('plan')
      .isIn(['Free', 'Basic', 'Pro'])
      .withMessage('Invalid plan type'),
    body('businessCategory')
      .optional()
      .trim()
      .isLength({ min: 2, max: 50 })
      .withMessage('Business category must be between 2 and 50 characters'),
    body('billingCycle')
      .optional()
      .isIn(['monthly', 'yearly'])
      .withMessage('Billing cycle must be monthly or yearly')
  ],
  
  verifyPayment: [
    body('razorpay_order_id')
      .notEmpty()
      .withMessage('Razorpay order ID is required'),
    body('razorpay_payment_id')
      .notEmpty()
      .withMessage('Razorpay payment ID is required'),
    body('razorpay_signature')
      .notEmpty()
      .withMessage('Razorpay signature is required')
  ]
};

export default {
  commonValidations,
  userValidations,
  restaurantValidations,
  categoryValidations,
  menuItemValidations,
  adminValidations,
  otpValidations,
  paymentValidations
};