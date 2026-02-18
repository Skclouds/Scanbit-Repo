import { body, validationResult } from 'express-validator';
import nodemailer from 'nodemailer';
import express from 'express';
import crypto from 'crypto';

import OtpCode from '../models/OtpCode.js';
import { strictBody } from '../middleware/validateInput.js';
import { generateOTP } from '../utils/otpStore.js';
import { getOTPEmailTemplate } from '../utils/emailTemplates.js';
import Restaurant from '../models/Restaurant.js';
import User from '../models/User.js';

function normalizeEmail(rawEmail) {
  return typeof rawEmail === 'string' ? rawEmail.toLowerCase().trim() : rawEmail;
}

function hashOtp(otp) {
  const secret = process.env.OTP_HASH_SECRET || (process.env.NODE_ENV === 'production' ? null : 'scanbit-otp-dev');
  if (!secret) throw new Error('OTP_HASH_SECRET is required in production');
  return crypto.createHmac('sha256', secret).update(String(otp)).digest('hex');
}


const router = express.Router();

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

// @route   POST /api/otp/send
// @desc    Send OTP to email (for registration or login)
// @access  Public
router.post('/send', strictBody(['email', 'type']), [
  body('email').isEmail().withMessage('Please provide a valid email'),
  body('type').optional().isIn(['registration', 'login']).withMessage('Type must be registration or login')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }

    const email = normalizeEmail(req.body.email);
    const { type = 'registration' } = req.body;

    // For registration, check if email already exists
    if (type === 'registration') {
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return res.status(400).json({
          success: false,
          message: 'Email already registered. Please login instead.'
        });
      }

      const existingRestaurant = await Restaurant.findOne({ email });
      if (existingRestaurant) {
        return res.status(400).json({
          success: false,
          message: 'Email already registered. Please login instead.'
        });
      }
    } else if (type === 'login') {
      // For login, check if user exists
      const existingUser = await User.findOne({ email });
      if (!existingUser) {
        return res.status(404).json({
          success: false,
          message: 'No account found with this email. Please register first.'
        });
      }
    }

    // Generate OTP and store in MongoDB (persistent across restarts/instances)
    const otp = generateOTP();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

    // Replace any existing OTPs for this email+type
    await OtpCode.deleteMany({ email, type });
    await OtpCode.create({
      email,
      type,
      otpHash: hashOtp(otp),
      attempts: 0,
      verified: false,
      verifiedAt: null,
      expiresAt,
    });
    
    const isDev = process.env.NODE_ENV === 'development';
    const smtpNotConfigured = !process.env.SMTP_USER || !process.env.SMTP_PASS;
    const includeOtpInResponse = isDev || smtpNotConfigured;

    // Send email only if SMTP is configured
    if (process.env.SMTP_USER && process.env.SMTP_PASS) {
      try {
        const transporter = createTransporter();
        const emailSubject = type === 'login'
          ? 'Login Verification Code - Scanbit'
          : 'Verify Your Email - Scanbit';
        const emailHtml = getOTPEmailTemplate(otp, type);

        await transporter.sendMail({
          from: `"ScanBit Support" <support@scanbit.in>`,
          replyTo: 'support@scanbit.in',
          to: email,
          subject: emailSubject,
          html: emailHtml
        });
      } catch (_emailError) {}
    }

    res.json({
      success: true,
      message: 'OTP sent successfully. Please check your email.',
      ...(includeOtpInResponse && { otp })
    });
  } catch (error) {

    res.status(500).json({
      success: false,
      message: error.message || 'Failed to send OTP'
    });
  }
});

// @route   POST /api/otp/verify
// @desc    Verify OTP
// @access  Public
router.post('/verify', strictBody(['email', 'otp', 'type']), [
  body('email').isEmail().withMessage('Please provide a valid email'),
  body('otp').isLength({ min: 6, max: 6 }).withMessage('OTP must be 6 digits'),
  body('type').optional().isIn(['registration', 'login']).withMessage('Type must be registration or login'),
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }

    const email = normalizeEmail(req.body.email);
    const { otp } = req.body;
    const type = req.body.type;

    const query = type ? { email, type } : { email };
    const record = await OtpCode.findOne(query).sort({ createdAt: -1 });
    if (!record) {
      return res.status(400).json({ success: false, message: 'OTP not found' });
    }
    if (record.expiresAt && record.expiresAt.getTime() < Date.now()) {
      await OtpCode.deleteMany({ email, type: record.type });
      return res.status(400).json({ success: false, message: 'OTP expired' });
    }
    if ((record.attempts || 0) >= 5) {
      await OtpCode.deleteMany({ email, type: record.type });
      return res.status(400).json({ success: false, message: 'Too many attempts' });
    }
    if (record.otpHash !== hashOtp(otp)) {
      record.attempts = (record.attempts || 0) + 1;
      await record.save();
      return res.status(400).json({
        success: false,
        message: 'Invalid OTP',
        attemptsRemaining: Math.max(0, 5 - (record.attempts || 0)),
      });
    }
    record.verified = true;
    record.verifiedAt = new Date();
    await record.save();

    res.json({
      success: true,
      message: 'Email verified successfully!',
      verified: true
    });
  } catch (error) {

    res.status(500).json({
      success: false,
      message: error.message || 'Failed to verify OTP'
    });
  }
});

// @route   GET /api/otp/status/:email
// @desc    Check OTP verification status
// @access  Public
router.get('/status/:email', async (req, res) => {
  try {
    const email = normalizeEmail(req.params.email);
    const record = await OtpCode.findOne({ email }).sort({ createdAt: -1 });

    if (!record) {
      return res.json({
        success: true,
        verified: false,
        message: 'No OTP found for this email'
      });
    }

    if (record.expiresAt && record.expiresAt.getTime() < Date.now()) {
      await OtpCode.deleteMany({ email, type: record.type });
      return res.json({
        success: true,
        verified: false,
        message: 'OTP expired'
      });
    }

    res.json({
      success: true,
      verified: record.verified === true,
      message: record.verified ? 'Email verified' : 'Email not verified'
    });
  } catch (error) {

    res.status(500).json({
      success: false,
      message: error.message || 'Failed to check OTP status'
    });
  }
});

export default router;
