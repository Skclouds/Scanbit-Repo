import { body, validationResult } from 'express-validator';
import nodemailer from 'nodemailer';
import express from 'express';
import crypto from 'crypto';

import { getPasswordResetEmailTemplate, getRegistrationSuccessEmailTemplate } from '../utils/emailTemplates.js';
import { sendEmail } from '../utils/emailService.js';
import getPublicWebsiteUrl from '../utils/publicUrl.js';
import OtpCode from '../models/OtpCode.js';
import { generateToken } from '../utils/generateToken.js';
import { setAuthCookie, clearAuthCookie } from '../utils/setAuthCookie.js';
import Restaurant from '../models/Restaurant.js';
import { protect } from '../middleware/auth.js';
import { strictBody } from '../middleware/validateInput.js';
import User from '../models/User.js';

const router = express.Router();

function normalizeEmail(rawEmail) {
  return (rawEmail || '').toString().toLowerCase().trim();
}

function hashOtp(otp) {
  const secret = process.env.OTP_HASH_SECRET || (process.env.NODE_ENV === 'production' ? null : 'scanbit-otp-dev');
  if (!secret) throw new Error('OTP_HASH_SECRET is required in production');
  return crypto.createHmac('sha256', secret).update(String(otp)).digest('hex');
}

async function hasVerifiedOtp(email, type) {
  const record = await OtpCode.findOne({ email, type, verified: true }).sort({ createdAt: -1 });
  if (!record) return false;
  if (record.expiresAt && record.expiresAt.getTime() < Date.now()) return false;
  return true;
}

async function verifyOtpOrThrow(email, type, otp) {
  const record = await OtpCode.findOne({ email, type }).sort({ createdAt: -1 });
  if (!record) return { ok: false, status: 401, message: 'OTP not found' };
  if (record.expiresAt && record.expiresAt.getTime() < Date.now()) {
    await OtpCode.deleteMany({ email, type });
    return { ok: false, status: 401, message: 'OTP expired' };
  }
  if ((record.attempts || 0) >= 5) {
    await OtpCode.deleteMany({ email, type });
    return { ok: false, status: 401, message: 'Too many attempts' };
  }
  if (record.otpHash !== hashOtp(otp)) {
    record.attempts = (record.attempts || 0) + 1;
    await record.save();
    return {
      ok: false,
      status: 401,
      message: 'Invalid OTP',
      attemptsRemaining: Math.max(0, 5 - (record.attempts || 0)),
    };
  }
  record.verified = true;
  record.verifiedAt = new Date();
  await record.save();
  return { ok: true };
}

async function consumeOtp(email, type) {
  await OtpCode.deleteMany({ email, type });
}

/** Normalize and sanitize address object. Max lengths per field. */
function sanitizeAddress(input) {
  if (!input || typeof input !== 'object') return {};
  const max = { street: 200, city: 80, state: 80, zipCode: 20, country: 80 };
  const out = {};
  ['street', 'city', 'state', 'zipCode', 'country'].forEach((k) => {
    let v = input[k];
    if (typeof v !== 'string') return;
    v = v.trim();
    if (v.length > max[k]) v = v.slice(0, max[k]);
    if (v) out[k] = v;
  });
  return out;
}

// Configure Nodemailer transporter
const createTransporter = () => {
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.SMTP_PORT || '587'),
    secure: process.env.SMTP_SECURE === 'true',
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });
};

// @route   POST /api/auth/register
// @desc    Register a new user
// @access  Public
router.post('/register', strictBody(['name', 'email', 'password', 'businessName', 'businessType', 'businessCategory', 'phone', 'address']), [
  body('name').trim().notEmpty().withMessage('Name is required').isLength({ min: 2, max: 50 }).withMessage('Name must be between 2 and 50 characters'),
  body('email').isEmail().withMessage('Please provide a valid email').normalizeEmail(),
  body('password')
    .isLength({ min: 8 }).withMessage('Password must be at least 8 characters long')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
    .withMessage('Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character'),
  body('businessName').trim().notEmpty().withMessage('Business name is required').isLength({ min: 2, max: 100 }).withMessage('Business name must be between 2 and 100 characters'),
  body('businessType').trim().notEmpty().withMessage('Business type is required'),
  body('businessCategory')
    .optional({ checkFalsy: true })
    .trim()
    .isLength({ max: 120 })
    .withMessage('Business category must be at most 120 characters'),
  body('phone')
    .optional({ checkFalsy: true })
    .trim()
    .isLength({ max: 20 })
    .withMessage('Phone must be at most 20 characters')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const errList = errors.array();
      const message = errList.map((e) => e.msg).join('. ');
      return res.status(400).json({
        success: false,
        message: message || 'Validation failed',
        errors: errList
      });
    }

    const raw = req.body;
    const name = (raw.name || '').trim();
    const email = normalizeEmail(raw.email);
    const businessName = (raw.businessName || '').trim();
    const businessType = (raw.businessType || '').trim();
    const businessCategory = (raw.businessCategory || '').trim() || null;
    const phone = (raw.phone || '').trim() || null;
    const address = sanitizeAddress(raw.address);

    // Check if email is verified via OTP (bypass in development)
    if (process.env.NODE_ENV !== 'development') {
      const verified = await hasVerifiedOtp(email, 'registration');
      if (!verified) {
        return res.status(400).json({
          success: false,
          message: 'Email not verified. Please verify your email with OTP first.'
        });
      }
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'User already exists with this email'
      });
    }

    const existingRestaurant = await Restaurant.findOne({ email });
    if (existingRestaurant) {
      return res.status(400).json({
        success: false,
        message: 'Restaurant already exists with this email'
      });
    }

    let user = null;
    let restaurant = null;

    try {
      user = await User.create({
        name,
        email,
        password: raw.password,
        role: 'user',
        businessCategory,
        businessType: businessType || null,
        registration_through: 'Self by website',
        registered_by_admin: null
      });

      const restaurantData = {
        name: businessName,
        businessType,
        email,
        phone,
        address: Object.keys(address).length ? address : {},
        owner: user._id,
        subscription: {
          plan: 'Free',
          planPrice: 0,
          status: 'active',
          startDate: new Date(),
          endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
          daysRemaining: 7
        },
        menuItemsLimit: '10'
      };
      if (businessCategory) restaurantData.businessCategory = businessCategory;

      restaurant = await Restaurant.create(restaurantData);

      user.restaurant = restaurant._id;
      await user.save();

      await consumeOtp(email, 'registration');
      const token = generateToken(user._id);
      setAuthCookie(res, token);

      const loginUrl = getPublicWebsiteUrl();
      const html = getRegistrationSuccessEmailTemplate(name, businessName, `${loginUrl}/login`);
      sendEmail(email, `Registration successful — ScanBit`, html).catch(() => {});

      return res.status(201).json({
        success: true,
        token,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          businessCategory: user.businessCategory,
          businessType: user.businessType
        },
        restaurant: {
          id: restaurant._id,
          name: restaurant.name,
          businessType: restaurant.businessType,
          businessCategory: restaurant.businessCategory,
          subscription: restaurant.subscription
        }
      });
    } catch (createError) {
      if (restaurant) {
        try {
          await Restaurant.findByIdAndDelete(restaurant._id);
        } catch (e) {

        }
      }
      if (user) {
        try {
          await User.findByIdAndDelete(user._id);
        } catch (e) {

        }
      }
      throw createError;
    }
  } catch (error) {

    // Handle duplicate email error
    if (error.code === 11000 || (error.keyPattern && error.keyPattern.email)) {
      return res.status(400).json({
        success: false,
        message: 'Email already exists. Please use a different email.'
      });
    }
    
    // Handle validation errors
    if (error.name === 'ValidationError') {
      const validationErrors = [];
      Object.values(error.errors || {}).forEach((err) => {
        validationErrors.push(err.message);
      });
      return res.status(400).json({
        success: false,
        message: validationErrors.join(', ') || 'Validation error',
        errors: validationErrors
      });
    }
    
    res.status(500).json({
      success: false,
      message: error.message || 'Server error during registration'
    });
  }
});

// @route   POST /api/auth/login
// @desc    Login user (with password or OTP)
// @access  Public
router.post('/login', strictBody(['email', 'password', 'otp']), [
  body('email').trim().isEmail().withMessage('Please provide a valid email').normalizeEmail(),
  // Password is optional if using OTP login
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const errList = errors.array();
      const message = errList.map((e) => e.msg).join('. ');
      return res.status(400).json({
        success: false,
        message: message || 'Validation failed',
        errors: errList
      });
    }

    const email = normalizeEmail(req.body.email);
    const { password, otp } = req.body;

    // Find user
    let user;
    if (password && password !== 'otp-verified') {
      // Password login - need password field
      user = await User.findOne({ email }).select('+password');
      if (!user) {
        return res.status(401).json({
          success: false,
          message: 'Invalid credentials'
        });
      }

      if (user.isActive === false) {
        return res.status(403).json({
          success: false,
          message: 'Account is deactivated. Please contact support.'
        });
      }

      // Check password
      const isMatch = await user.comparePassword(password);
      if (!isMatch) {
        return res.status(401).json({
          success: false,
          message: 'Invalid credentials'
        });
      }
    } else if (otp || password === 'otp-verified') {
      // OTP login - persistent (MongoDB) verification
      if (otp) {
        const v = await verifyOtpOrThrow(email, 'login', otp);
        if (!v.ok) {
          return res.status(v.status || 401).json({
            success: false,
            message: v.message || 'Invalid OTP',
            ...(v.attemptsRemaining !== undefined ? { attemptsRemaining: v.attemptsRemaining } : {}),
          });
        }
      } else {
        const verified = await hasVerifiedOtp(email, 'login');
        if (!verified) {
          return res.status(401).json({
            success: false,
            message: 'OTP not verified. Please verify your OTP first.'
          });
        }
      }

      // Find user without password field
      user = await User.findOne({ email });
      if (!user) {
        return res.status(401).json({
          success: false,
          message: 'User not found'
        });
      }

      if (user.isActive === false) {
        return res.status(403).json({
          success: false,
          message: 'Account is deactivated. Please contact support.'
        });
      }

      // OTP will be deleted after successful login (below)
    } else {
      return res.status(400).json({
        success: false,
        message: 'Please provide either password or verify OTP first'
      });
    }

    // Delete OTP after successful login (if OTP was used)
    if (password === 'otp-verified' || otp) {
      await consumeOtp(email, 'login');
    }

    // Update last login without triggering full validation
    await User.updateOne({ _id: user._id }, { $set: { lastLogin: new Date() } });

    // Get restaurant if exists
    let restaurant = null;
    if (user.restaurant) {
      restaurant = await Restaurant.findById(user.restaurant);
    }

    const token = generateToken(user._id);
    setAuthCookie(res, token);

    res.json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        businessCategory: user.businessCategory,
        businessType: user.businessType
      },
      restaurant: restaurant ? {
        id: restaurant._id,
        name: restaurant.name,
        businessType: restaurant.businessType,
        businessCategory: restaurant.businessCategory,
        subscription: restaurant.subscription
      } : null
    });
  } catch (error) {

    // Handle validation errors
    if (error.name === 'ValidationError') {
      return res.status(400).json({
        success: false,
        message: 'Invalid input. Please check your email and password format.'
      });
    }
    
    res.status(500).json({
      success: false,
      message: error.message || 'Server error during login'
    });
  }
});

// @route   POST /api/auth/logout
// @desc    Clear auth cookie (call with credentials so cookie is sent and cleared)
// @access  Public
router.post('/logout', (req, res) => {
  clearAuthCookie(res);
  res.json({ success: true, message: 'Logged out' });
});

// @route   GET /api/auth/me
// @desc    Get current user
// @access  Private
router.get('/me', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).populate('restaurant');
    
    res.json({
      success: true,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        businessCategory: user.businessCategory,
        businessType: user.businessType,
        profileImage: user.profileImage,
        phone: user.phone,
        address: user.address,
        bio: user.bio,
        isMasterAdmin: user.isMasterAdmin || false,
        hasAdminAccess: user.hasAdminAccess || false,
        permissions: user.permissions || {},
        isActive: user.isActive,
        restaurant: user.restaurant
      }
    });
  } catch (error) {

    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   PUT /api/auth/profile
// @desc    Update current user profile
// @access  Private
router.put('/profile', protect, [
  body('name').optional().trim().notEmpty().withMessage('Name cannot be empty'),
  body('phone').optional().trim(),
  body('address').optional(),
  body('bio').optional().trim(),
  body('profileImage').optional().isURL().withMessage('Profile image must be a valid URL'),
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }

    const { name, phone, address, bio, profileImage } = req.body;
    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Update allowed fields
    if (name !== undefined) user.name = name;
    if (phone !== undefined) user.phone = phone;
    if (address !== undefined) user.address = address;
    if (bio !== undefined) user.bio = bio;
    if (profileImage !== undefined) user.profileImage = profileImage;

    await user.save();

    // Populate restaurant for response
    await user.populate('restaurant');

    res.json({
      success: true,
      message: 'Profile updated successfully',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        businessCategory: user.businessCategory,
        businessType: user.businessType,
        profileImage: user.profileImage,
        phone: user.phone,
        address: user.address,
        bio: user.bio,
        restaurant: user.restaurant
      }
    });
  } catch (error) {

    res.status(500).json({
      success: false,
      message: error.message || 'Server error'
    });
  }
});

// @route   POST /api/auth/forgot-password
// @desc    Request password reset
// @access  Public
router.post('/forgot-password', [
  body('email').trim().isEmail().withMessage('Please provide a valid email').normalizeEmail()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }

    const email = (req.body.email || '').toLowerCase().trim();

    // Find user
    const user = await User.findOne({ email });
    
    // Return success with emailSent flag: user requested explicit feedback for UX
    if (!user) {
      return res.json({
        success: true,
        emailSent: false,
        message: 'No account found with this email address. Please register first.'
      });
    }

    // Generate reset code (alphanumeric - text and numbers)
    // Format: 8 characters with mix of letters and numbers
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // Removed confusing chars like 0, O, I, 1
    let resetCode = '';
    for (let i = 0; i < 8; i++) {
      resetCode += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    const expiresAt = Date.now() + 60 * 60 * 1000; // 1 hour
    const codeHash = crypto.createHash('sha256').update(resetCode).digest('hex');

    // Store on user so it survives restarts
    user.passwordResetCode = codeHash;
    user.passwordResetExpires = new Date(expiresAt);
    await user.save({ validateBeforeSave: false });

    // Send email only if SMTP is configured
    if (process.env.SMTP_USER && process.env.SMTP_PASS) {
      try {
        const transporter = createTransporter();
        const emailHtml = getPasswordResetEmailTemplate(resetCode, user.name);
        
        await transporter.sendMail({
          from: `"ScanBit Support" <support@scanbit.in>`,
          replyTo: 'support@scanbit.in',
          to: email,
          subject: 'Reset Your Password - ScanBit',
          html: emailHtml
        });
      } catch (emailError) {

        // Continue even if email fails
      }
    } else {
    }

    res.json({
      success: true,
      emailSent: true,
      message: 'Password reset code has been sent to your email.'
    });
  } catch (error) {

    res.status(500).json({
      success: false,
      message: 'Server error. Please try again later.'
    });
  }
});

// @route   POST /api/auth/reset-password
// @desc    Reset password with code
// @access  Public
router.post('/reset-password', [
  body('code').notEmpty().withMessage('Reset code is required'),
  body('password')
    .isLength({ min: 8 }).withMessage('Password must be at least 8 characters long')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
    .withMessage('Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }

    const { code, password } = req.body;

    const codeUpper = code.toUpperCase();
    const codeHash = crypto.createHash('sha256').update(codeUpper).digest('hex');

    const user = await User.findOne({
      passwordResetCode: codeHash,
      passwordResetExpires: { $gt: new Date() }
    }).select('+password +passwordResetCode');

    if (!user) {
      return res.status(400).json({
        success: false,
        message: 'Invalid or expired reset code. Please request a new password reset.'
      });
    }

    // Update password
    user.password = password;
    await user.save();

    // Clear reset code after successful reset
    user.passwordResetCode = null;
    user.passwordResetExpires = null;
    await user.save();

    res.json({
      success: true,
      message: 'Password reset successfully! You can now login with your new password.'
    });
  } catch (error) {

    res.status(500).json({
      success: false,
      message: 'Server error. Please try again later.'
    });
  }
});

export default router;
