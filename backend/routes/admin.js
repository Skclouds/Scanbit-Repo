import { body, validationResult } from 'express-validator';
import nodemailer from 'nodemailer';
import express from 'express';
import multer from 'multer';

import OtpCode from '../models/OtpCode.js';
import { protect, authorize } from '../middleware/auth.js';
import Restaurant from '../models/Restaurant.js';
import BusinessCategory from '../models/BusinessCategory.js';
import Payment from '../models/Payment.js';
import QRScan from '../models/QRScan.js';
import User from '../models/User.js';
import Plan from '../models/Plan.js';
import BrochureDownload from '../models/BrochureDownload.js';
import BulkEmailLog from '../models/BulkEmailLog.js';
import { sendEmail } from '../utils/emailService.js';


const router = express.Router();

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

async function hasVerifiedRegistrationOtp(email) {
  const normalized = (email || '').toString().toLowerCase().trim();
  const record = await OtpCode.findOne({ email: normalized, type: 'registration', verified: true }).sort({ createdAt: -1 });
  if (!record) return false;
  if (record.expiresAt && record.expiresAt.getTime() < Date.now()) return false;
  return true;
}

async function consumeRegistrationOtp(email) {
  const normalized = (email || '').toString().toLowerCase().trim();
  await OtpCode.deleteMany({ email: normalized, type: 'registration' });
}

/**
 * Compute subscription daysRemaining and status from endDate (source of truth).
 * Use when returning subscriptions to admin so Expired/Days Remaining are always correct.
 */
function enrichSubscriptionFromEndDate(sub) {
  if (!sub) return sub;
  const plain = sub.toObject ? sub.toObject() : { ...sub };
  const endDate = plain.endDate ? new Date(plain.endDate) : null;
  if (!endDate) return plain;
  const now = new Date();
  const diffMs = endDate.getTime() - now.getTime();
  const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
  plain.daysRemaining = Math.max(0, diffDays);
  if (diffDays <= 0 && (plain.status === 'active' || !plain.status)) {
    plain.status = 'expired';
  }
  return plain;
}

function enrichRestaurantSubscription(restaurant) {
  const doc = restaurant.toObject ? restaurant.toObject() : { ...restaurant };
  if (doc.subscription) {
    doc.subscription = enrichSubscriptionFromEndDate(doc.subscription);
  }
  return doc;
}

// All routes require admin role
router.use(protect);
router.use(authorize('admin'));

// @route   GET /api/admin/stats
// @desc    Get admin dashboard statistics
// @access  Private/Admin
router.get('/stats', async (req, res) => {
  try {
    const totalUsers = await User.countDocuments({ role: { $ne: 'admin' } });
    const activeUsers = await User.countDocuments({ 
      role: { $ne: 'admin' },
      $or: [
        { isActive: { $ne: false } },
        { isActive: { $exists: false } }
      ]
    });
    const inactiveUsers = await User.countDocuments({ 
      role: { $ne: 'admin' },
      isActive: false
    });
    
    const totalRestaurants = await Restaurant.countDocuments();
    const verifiedBusinesses = await Restaurant.countDocuments({
      $or: [
        { verificationStatus: 'verified' },
        { isVerified: true }
      ]
    });
    const pendingBusinesses = await Restaurant.countDocuments({
      isArchived: false,
      $or: [
        { verificationStatus: 'pending' },
        {
          verificationStatus: { $exists: false },
          isVerified: { $ne: true }
        }
      ]
    });
    
    const activeSubscriptions = await Restaurant.countDocuments({
      'subscription.status': 'active'
    });
    const expiredSubscriptions = await Restaurant.countDocuments({
      'subscription.status': 'inactive'
    });
    
    // Calculate monthly revenue from all active subscriptions
    const restaurants = await Restaurant.find({ 'subscription.status': 'active' });
    const monthlyRevenue = restaurants.reduce((sum, r) => {
      return sum + (r.subscription?.planPrice || 0);
    }, 0);

    // Calculate total QR scans
    const totalQRScans = await QRScan.countDocuments();

    // Get new restaurants this month
    const thisMonth = new Date();
    thisMonth.setDate(1);
    thisMonth.setHours(0, 0, 0, 0);
    const newThisMonth = await Restaurant.countDocuments({
      createdAt: { $gte: thisMonth }
    });
    
    // Get plan distribution
    const planDistribution = {
      Free: { count: 0, revenue: 0 },
      Basic: { count: 0, revenue: 0 },
      Pro: { count: 0, revenue: 0 }
    };
    
    const plansByBusinessType = {
      'Food Mall': { Free: { count: 0, revenue: 0 }, Basic: { count: 0, revenue: 0 }, Pro: { count: 0, revenue: 0 } },
      'Retail / E-Commerce Businesses': { Free: { count: 0, revenue: 0 }, Basic: { count: 0, revenue: 0 }, Pro: { count: 0, revenue: 0 } },
      'Creative & Design': { Free: { count: 0, revenue: 0 }, Basic: { count: 0, revenue: 0 }, Pro: { count: 0, revenue: 0 } }
    };
    
    // Get all restaurants for distribution calculation
    const allRestaurants = await Restaurant.find({});
    allRestaurants.forEach(r => {
      const plan = r.subscription?.plan || 'Free';
      const businessCategory = r.businessCategory || 'Food Mall';
      const price = r.subscription?.planPrice || 0;
      
      if (plan in planDistribution) {
        planDistribution[plan].count++;
        planDistribution[plan].revenue += price;
      }
      
      if (businessCategory in plansByBusinessType && plan in plansByBusinessType[businessCategory]) {
        plansByBusinessType[businessCategory][plan].count++;
        plansByBusinessType[businessCategory][plan].revenue += price;
      }
    });

    // Get recent businesses (last 10)
    const recentBusinesses = await Restaurant.find({})
      .sort({ createdAt: -1 })
      .limit(10)
      .populate('owner', 'name email')
      .select('name email businessCategory subscription qrScans logo ownerImage profileImage createdAt');

    res.json({
      success: true,
      data: {
        totalUsers,
        activeUsers,
        inactiveUsers,
        totalRestaurants,
        verifiedBusinesses,
        pendingBusinesses,
        activeSubscriptions,
        expiredSubscriptions,
        monthlyRevenue,
        totalQRScans,
        newThisMonth,
        planDistribution,
        plansByBusinessType,
        recentBusinesses
      }
    });
  } catch (error) {

    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   GET /api/admin/users
// @desc    Get all users with filters and pagination
// @access  Private/Admin
router.get('/users', async (req, res) => {
  try {
    const { page = 1, limit = 50, role, search, sortBy = 'createdAt', sortOrder = 'desc', includeAdmins = 'false' } = req.query;
    
    // Build query
    const query = {};
    
    // By default exclude admin users unless includeAdmins is true
    if (includeAdmins !== 'true') {
      query.role = { $ne: 'admin' };
    }
    
    if (role) {
      query.role = role;
    }
    
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }

    // Calculate pagination
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    // Get users with restaurant data and admin info
    const users = await User.find(query)
      .populate('restaurant', 'name email businessType businessCategory subscription logo ownerImage profileImage')
      .populate('registered_by_admin', 'name email')
      .select('-password')
      .sort({ [sortBy]: sortOrder === 'desc' ? -1 : 1 })
      .skip(skip)
      .limit(limitNum);

    const total = await User.countDocuments(query);

    res.json({
      success: true,
      data: users,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        pages: Math.ceil(total / limitNum)
      }
    });
  } catch (error) {

    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   GET /api/admin/restaurants
// @desc    Get all restaurants with filters and pagination
// @access  Private/Admin
router.get('/restaurants', async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 50, 
      search, 
      businessCategory,
      businessType,
      verificationStatus,
      subscriptionStatus,
      isArchived = 'false',
      sortBy = 'createdAt', 
      sortOrder = 'desc' 
    } = req.query;
    
    // Build query
    const query = {};
    
    // Filter by archive status
    query.isArchived = isArchived === 'true' ? true : false;
    
    // Search in name, email, description
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }
    
    // Filter by business category
    if (businessCategory && businessCategory !== '') {
      query.businessCategory = businessCategory;
    }
    
    // Filter by business type
    if (businessType && businessType !== '') {
      query.businessType = businessType;
    }
    
    // Filter by verification status
    if (verificationStatus && verificationStatus !== '') {
      if (verificationStatus === 'verified') {
        query.isVerified = true;
        query.verificationStatus = 'verified';
      } else if (verificationStatus === 'pending') {
        query.$or = [
          { verificationStatus: 'pending' },
          {
            verificationStatus: { $exists: false },
            isVerified: { $ne: true }
          }
        ];
      } else if (verificationStatus === 'rejected') {
        query.verificationStatus = 'rejected';
        query.isVerified = false;
      }
    }
    
    // Filter by subscription status
    if (subscriptionStatus && subscriptionStatus !== '') {
      query['subscription.status'] = subscriptionStatus;
    }

    // Calculate pagination
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    // Get restaurants
    const restaurants = await Restaurant.find(query)
      .populate('owner', 'name email phone')
      .populate('subscription.plan', 'name pricing')
      .select('-password')
      .sort({ [sortBy]: sortOrder === 'desc' ? -1 : 1 })
      .skip(skip)
      .limit(limitNum);

    const total = await Restaurant.countDocuments(query);

    const enriched = restaurants.map(enrichRestaurantSubscription);

    res.json({
      success: true,
      data: enriched,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        totalPages: Math.ceil(total / limitNum)
      }
    });
  } catch (error) {

    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   GET /api/admin/restaurants/:id
// @desc    Get a specific restaurant
// @access  Private/Admin
router.get('/restaurants/:id', async (req, res) => {
  try {
    const restaurant = await Restaurant.findById(req.params.id)
      .populate('owner', 'name email phone businessType')
      .populate('subscription.plan');

    if (!restaurant) {
      return res.status(404).json({
        success: false,
        message: 'Restaurant not found'
      });
    }

    res.json({
      success: true,
      data: restaurant
    });
  } catch (error) {

    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   PUT /api/admin/restaurants/:id
// @desc    Update a restaurant
// @access  Private/Admin
router.put('/restaurants/:id', async (req, res) => {
  try {
    const { 
      isVerified, 
      verificationStatus, 
      isArchived, 
      subscription,
      businessType,
      businessCategory 
    } = req.body;

    const updateData = {};
    if (isVerified !== undefined) {
      updateData.isVerified = isVerified;
      // Set verifiedAt timestamp when verifying
      if (isVerified === true) {
        updateData.verifiedAt = new Date();
      }
    }
    if (verificationStatus !== undefined) {
      updateData.verificationStatus = verificationStatus;
      // Ensure isVerified is set correctly based on verificationStatus
      if (verificationStatus === 'verified') {
        updateData.isVerified = true;
        updateData.verifiedAt = new Date();
      } else if (verificationStatus === 'rejected' || verificationStatus === 'pending') {
        updateData.isVerified = false;
      }
    }
    if (isArchived !== undefined) {
      updateData.isArchived = isArchived;
      // Set archivedAt timestamp when archiving
      if (isArchived === true) {
        updateData.archivedAt = new Date();
      } else if (isArchived === false) {
        updateData.archivedAt = null;
      }
    }
    if (businessType !== undefined) updateData.businessType = businessType;
    if (businessCategory !== undefined) updateData.businessCategory = businessCategory;
    if (subscription !== undefined) updateData.subscription = subscription;

    const restaurant = await Restaurant.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    ).populate('owner', 'name email phone')
    .populate('subscription.plan');

    if (!restaurant) {
      return res.status(404).json({
        success: false,
        message: 'Restaurant not found'
      });
    }

    res.json({
      success: true,
      message: 'Restaurant updated successfully',
      data: restaurant
    });
  } catch (error) {

    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   DELETE /api/admin/restaurants/:id
// @desc    Permanently delete a restaurant (hard delete)
// @access  Private/Admin
router.delete('/restaurants/:id', async (req, res) => {
  try {
    const restaurant = await Restaurant.findById(req.params.id);

    if (!restaurant) {
      return res.status(404).json({
        success: false,
        message: 'Restaurant not found'
      });
    }

    // Delete associated owner user if exists
    if (restaurant.owner) {
      try {
        await User.findByIdAndDelete(restaurant.owner);
      } catch (userError) {

        // Continue with restaurant deletion even if user deletion fails
      }
    }

    // Permanently delete the restaurant
    await Restaurant.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: 'Restaurant permanently deleted successfully'
    });
  } catch (error) {

    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   POST /api/admin/users
// @desc    Create a new user (admin-assisted registration)
// @access  Private/Admin
router.post('/users', async (req, res) => {
  try {
    const {
      name,
      email,
      password,
      businessName,
      businessType,
      businessCategory,
      phone,
      address
    } = req.body;

    if (!name || !email || !password || !businessName || !businessType) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields'
      });
    }

    // Validate password strength
    if (password.length < 8) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 8 characters long'
      });
    }

    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/;
    if (!passwordRegex.test(password)) {
      return res.status(400).json({
        success: false,
        message: 'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character'
      });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid email address'
      });
    }

    // Require OTP verification, same as public registration flow (persistent)
    if (!(await hasVerifiedRegistrationOtp(email))) {
      return res.status(400).json({
        success: false,
        message: 'Email not verified via OTP. Please complete OTP verification first.',
      });
    }

    // Prevent duplicates
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'User already exists with this email',
      });
    }

    const existingRestaurant = await Restaurant.findOne({ email });
    if (existingRestaurant) {
      return res.status(400).json({
        success: false,
        message: 'Restaurant already exists with this email',
      });
    }

    // Create user
    const user = await User.create({
      name,
      email,
      password,
      role: 'user',
      businessCategory: businessCategory || null,
      businessType: businessType || null,
      registration_through: 'By admin',
      registered_by_admin: req.user._id,
    });

    // Create restaurant
    const restaurantData = {
      name: businessName,
      businessType,
      email,
      phone,
      address: address || {},
      owner: user._id,
      subscription: {
        plan: 'Free',
        planPrice: 0,
        status: 'active',
        startDate: new Date(),
        endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        daysRemaining: 7,
      },
      menuItemsLimit: '10',
    };

    if (businessCategory) {
      restaurantData.businessCategory = businessCategory;
    }

    const restaurant = await Restaurant.create(restaurantData);

    // Link restaurant to user
    user.restaurant = restaurant._id;
    await user.save();

    // Clear OTP after successful admin registration
    await consumeRegistrationOtp(email);

    // Send credentials email if SMTP configured
    if (process.env.SMTP_USER && process.env.SMTP_PASS) {
      try {
        const transporter = createTransporter();
        const COMPANY_WEBSITE = 'https://scanbit.in';
        const LOGO_URL = `${COMPANY_WEBSITE}/logo.svg`;
        const subject = 'Your ScanBit Account Details';
        const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${subject}</title>
</head>
<body style="margin:0;padding:0;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,'Helvetica Neue',Arial,sans-serif;background-color:#f9fafb;">
  <table role="presentation" style="width:100%;border-collapse:collapse;background-color:#f9fafb;">
    <tr>
      <td style="padding:40px 20px;">
        <table role="presentation" style="max-width:600px;margin:0 auto;background-color:#ffffff;border-radius:16px;box-shadow:0 4px 6px rgba(0,0,0,0.1);overflow:hidden;">
          <tr>
            <td style="background:linear-gradient(135deg,#f97316 0%,#ea580c 100%);padding:40px 30px;text-align:center;">
              <div style="margin-bottom:16px;">
                <img src="${LOGO_URL}" alt="ScanBit" style="height:60px;width:auto;max-width:200px;margin:0 auto;display:block;" />
              </div>
              <h1 style="margin:0;color:#ffffff;font-size:32px;font-weight:700;letter-spacing:-0.5px;">
                ScanBit
              </h1>
              <p style="margin:8px 0 0 0;color:rgba(255,255,255,0.9);font-size:16px;font-weight:400;">
                One QR. One Digital Look.
              </p>
            </td>
          </tr>
          <tr>
            <td style="padding:40px 30px;">
              <h2 style="margin:0 0 16px 0;color:#1f2937;font-size:24px;font-weight:700;line-height:1.3;">
                Your ScanBit account has been created
              </h2>
              <p style="margin:0 0 16px 0;color:#4b5563;font-size:16px;line-height:1.6;">
                Hi ${name || 'there'},
              </p>
              <p style="margin:0 0 24px 0;color:#4b5563;font-size:16px;line-height:1.6;">
                An administrator has created a ScanBit account for your business <strong>${businessName}</strong>.
              </p>
              <div style="margin:24px 0;padding:16px;border-radius:8px;background-color:#f9fafb;border:1px solid #e5e7eb;">
                <p style="margin:0 0 8px 0;color:#111827;font-size:14px;font-weight:600;">
                  Login credentials:
                </p>
                <p style="margin:0;color:#4b5563;font-size:14px;line-height:1.6;">
                  <strong>Email:</strong> ${email}<br/>
                  <strong>Temporary password:</strong> ${password}
                </p>
              </div>
              <p style="margin:24px 0 0 0;color:#4b5563;font-size:14px;line-height:1.6;">
                For security, please login and change your password immediately after your first sign in.
              </p>
              <div style="text-align:center;margin:32px 0;">
                <a href="${COMPANY_WEBSITE}/login" style="display:inline-block;background:linear-gradient(135deg,#f97316 0%,#ea580c 100%);color:#ffffff;text-decoration:none;padding:14px 32px;border-radius:8px;font-weight:600;font-size:16px;">
                  Login Now
                </a>
              </div>
            </td>
          </tr>
          <tr>
            <td style="background-color:#f9fafb;padding:30px;border-top:1px solid #e5e7eb;">
              <table role="presentation" style="width:100%;border-collapse:collapse;">
                <tr>
                  <td style="text-align:center;padding-bottom:20px;">
                    <p style="margin:0 0 16px 0;color:#6b7280;font-size:14px;line-height:1.6;">
                      Need help? Contact us at <a href="mailto:support@scanbit.in" style="color:#f97316;text-decoration:none;font-weight:500;">support@scanbit.in</a>
                    </p>
                    <div style="margin:20px 0;">
                      <a href="${COMPANY_WEBSITE}" style="display:inline-block;margin:0 12px;color:#f97316;text-decoration:none;font-size:14px;font-weight:500;">Visit Website</a>
                      <span style="color:#d1d5db;">|</span>
                      <a href="${COMPANY_WEBSITE}/terms-of-service" style="display:inline-block;margin:0 12px;color:#f97316;text-decoration:none;font-size:14px;font-weight:500;">Terms of Service</a>
                      <span style="color:#d1d5db;">|</span>
                      <a href="${COMPANY_WEBSITE}/privacy-policy" style="display:inline-block;margin:0 12px;color:#f97316;text-decoration:none;font-size:14px;font-weight:500;">Privacy Policy</a>
                    </div>
                  </td>
                </tr>
                <tr>
                  <td style="text-align:center;padding-top:20px;border-top:1px solid #e5e7eb;">
                    <p style="margin:0;color:#9ca3af;font-size:12px;line-height:1.5;">
                      © ${new Date().getFullYear()} ScanBit. All rights reserved.
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
        `.trim();

        await transporter.sendMail({
          from: `"ScanBit Support" <support@scanbit.in>`,
          replyTo: 'support@scanbit.in',
          to: email,
          subject,
          html,
        });
      } catch (emailError) {

      }
    }

    res.status(201).json({
      success: true,
      data: {
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          registration_through: user.registration_through,
        },
        restaurant: {
          id: restaurant._id,
          name: restaurant.name,
          businessType: restaurant.businessType,
          businessCategory: restaurant.businessCategory,
        },
      },
      message: 'User registered by admin successfully',
    });
  } catch (error) {

    res.status(500).json({
      success: false,
      message: 'Server error while creating user by admin',
    });
  }
});

// @route   GET /api/admin/users/:id
// @desc    Get single user details
// @access  Private/Admin
router.get('/users/:id', async (req, res) => {
  try {
    const user = await User.findById(req.params.id)
      .populate('restaurant')
      .select('-password');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.json({
      success: true,
      data: user
    });
  } catch (error) {

    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   PUT /api/admin/users/:id
// @desc    Update user (activate/deactivate, change role, permissions, user details, business details)
// @access  Private/Admin
router.put('/users/:id', async (req, res) => {
  try {
    const { 
      isActive, 
      role, 
      permissions, 
      hasAdminAccess,
      name,
      email,
      phone,
      businessName,
      businessType,
      businessCategory
    } = req.body;
    
    // Get the user being updated
    const userToUpdate = await User.findById(req.params.id);
    
    if (!userToUpdate) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    // PROTECTION: Prevent any changes to master admin account
    const MASTER_ADMIN_EMAIL = 'rudranshdevelopment@gmail.com';
    if (userToUpdate.email === MASTER_ADMIN_EMAIL || userToUpdate.isMasterAdmin) {
      return res.status(403).json({
        success: false,
        message: 'Master Admin account cannot be modified. This account is protected.'
      });
    }
    
    // Check if current user is master admin
    const currentUser = await User.findById(req.user._id);
    const isMasterAdmin = currentUser?.isMasterAdmin || 
      currentUser?.email === 'rudranshdevelopment@gmail.com' ||
      (currentUser?.role === 'admin' && 
       (await User.countDocuments({ role: 'admin', createdAt: { $lt: currentUser.createdAt } })) === 0);
    
    // If updating sensitive fields (permissions, role, admin access), check if requester is authorized
    if ((permissions !== undefined || role !== undefined || hasAdminAccess !== undefined) && 
        !isMasterAdmin && userToUpdate.role === 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Only Master Admin can modify admin users'
      });
    }
    
    const update = {
      updatedAt: new Date()
    };

    // Update user basic info
    if (name) update.name = name;
    if (email) update.email = email;
    if (phone) update.phone = phone;

    if (typeof isActive === 'boolean') {
      update.isActive = isActive;
    }

    if (role && ['admin', 'user'].includes(role)) {
      update.role = role;
      // If demoting from admin, remove admin access
      if (role === 'user') {
        update.hasAdminAccess = false;
        update.permissions = {};
      }
    }

    // Handle permissions update (only master admin)
    if (permissions !== undefined && typeof permissions === 'object') {
      update.permissions = permissions;
    }

    // Handle hasAdminAccess
    if (typeof hasAdminAccess === 'boolean') {
      update.hasAdminAccess = hasAdminAccess;
      // If disabling admin access, clear permissions
      if (!hasAdminAccess) {
        update.permissions = {};
      }
    }
    
    const user = await User.findByIdAndUpdate(
      req.params.id,
      update,
      { new: true, runValidators: true }
    ).select('-password').populate('restaurant');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Update restaurant if business details provided and restaurant exists
    if (user.restaurant && (businessName || businessType || businessCategory)) {
      const restaurantUpdate = {};
      if (businessName) restaurantUpdate.name = businessName;
      if (businessType) restaurantUpdate.businessType = businessType;
      if (businessCategory) restaurantUpdate.businessCategory = businessCategory;
      
      await Restaurant.findByIdAndUpdate(
        user.restaurant._id || user.restaurant,
        restaurantUpdate,
        { new: true, runValidators: true }
      );
    }

    // Fetch updated user with restaurant data
    const updatedUser = await User.findById(user._id)
      .select('-password')
      .populate('restaurant');

    res.json({
      success: true,
      data: updatedUser,
      message: 'User updated successfully'
    });
  } catch (error) {

    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   POST /api/admin/users/:id/assign-plan
// @desc    Assign a plan to a user's restaurant
// @access  Private/Admin
router.post('/users/:id/assign-plan', async (req, res) => {
  try {
    const { planId } = req.body;

    if (!planId) {
      return res.status(400).json({
        success: false,
        message: 'Plan ID is required'
      });
    }

    const user = await User.findById(req.params.id).populate('restaurant');
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    if (!user.restaurant) {
      return res.status(400).json({
        success: false,
        message: 'User does not have a restaurant/business'
      });
    }

    const plan = await Plan.findById(planId);
    
    if (!plan) {
      return res.status(404).json({
        success: false,
        message: 'Plan not found'
      });
    }

    // Calculate effective price for custom plans
    let effectivePrice = plan.price;
    if (plan.customPricing?.enabled) {
      if (plan.customPricing.overridePrice !== null && plan.customPricing.overridePrice !== undefined) {
        effectivePrice = plan.customPricing.overridePrice;
      } else if (plan.customPricing.discountPercent > 0) {
        effectivePrice = plan.price * (1 - plan.customPricing.discountPercent / 100);
      }
    }

    // Update restaurant subscription
    const restaurantId = user.restaurant._id || user.restaurant;
    
    // Calculate subscription duration based on plan and billing cycle
    const isFreeplan = plan.name === 'Free' || effectivePrice === 0;
    const billingCycle = plan.billingCycle || 'monthly';
    
    // Free trial = 7 days, Monthly = 30 days, Yearly = 365 days
    let subscriptionDays = isFreeplan ? 7 : (billingCycle === 'yearly' ? 365 : 30);
    
    const subscriptionUpdate = {
      'subscription.planId': planId,
      'subscription.plan': plan.name,
      'subscription.planPrice': effectivePrice,
      'subscription.originalPrice': plan.price,
      'subscription.billingCycle': billingCycle,
      'subscription.status': 'active',
      'subscription.startDate': new Date(),
      'subscription.endDate': new Date(Date.now() + subscriptionDays * 24 * 60 * 60 * 1000),
      'subscription.daysRemaining': subscriptionDays,
    };

    // Update menu items limit based on plan
    if (plan.features?.menuItemsLimit) {
      subscriptionUpdate.menuItemsLimit = plan.features.menuItemsLimit;
    } else if (plan.name === 'Free') {
      subscriptionUpdate.menuItemsLimit = '10';
    } else if (plan.name === 'Basic' || plan.name === 'Starter') {
      subscriptionUpdate.menuItemsLimit = '100';
    } else if (plan.name === 'Pro' || plan.name === 'Premium') {
      subscriptionUpdate.menuItemsLimit = 'unlimited';
    }

    const restaurant = await Restaurant.findByIdAndUpdate(
      restaurantId,
      subscriptionUpdate,
      { new: true, runValidators: true }
    );

    if (!restaurant) {
      return res.status(404).json({
        success: false,
        message: 'Restaurant not found'
      });
    }

    res.json({
      success: true,
      data: {
        user,
        restaurant
      },
      message: `${plan.name} plan assigned successfully to ${user.name}'s business`
    });
  } catch (error) {


    res.status(500).json({
      success: false,
      message: error.message || 'Server error',
      error: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
});

// @route   DELETE /api/admin/users/:id
// @desc    Delete user
// @access  Private/Admin
router.delete('/users/:id', async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // PROTECTION: Prevent deletion of master admin account
    const MASTER_ADMIN_EMAIL = 'rudranshdevelopment@gmail.com';
    if (user.email === MASTER_ADMIN_EMAIL || user.isMasterAdmin) {
      return res.status(403).json({
        success: false,
        message: 'Master Admin account cannot be deleted. This account is protected.'
      });
    }

    // Check if requester is master admin (only master admin can delete other admins)
    const currentUser = await User.findById(req.user._id);
    const isMasterAdmin = currentUser?.isMasterAdmin || 
      currentUser?.email === 'rudranshdevelopment@gmail.com' ||
      (currentUser?.role === 'admin' && 
       (await User.countDocuments({ role: 'admin', createdAt: { $lt: currentUser.createdAt } })) === 0);
    
    if (user.role === 'admin' && !isMasterAdmin) {
      return res.status(403).json({
        success: false,
        message: 'Only Master Admin can delete admin users'
      });
    }

    // Also delete associated restaurant if exists
    if (user.restaurant) {
      await Restaurant.findByIdAndDelete(user.restaurant);
    }

    await User.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: 'User deleted successfully'
    });
  } catch (error) {

    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// ==================== PLANS MANAGEMENT ====================

// @route   GET /api/admin/plans
// @desc    Get all plans
// @access  Private/Admin
router.get('/plans', async (req, res) => {
  try {
    const { businessCategory, isActive } = req.query;
    const query = {};
    
    if (businessCategory) {
      query.businessCategory = businessCategory;
    }
    if (isActive !== undefined) {
      query.isActive = isActive === 'true';
    }

    // Only show regular plans to non-master admins
    const isMasterAdmin = req.user.isMasterAdmin === true || 
                         req.user.email === 'rudranshdevelopment@gmail.com';
    
    if (!isMasterAdmin) {
      query.isCustom = false;
    }

    const plans = await Plan.find(query)
      .populate('assignedToUser', 'name email')
      .sort({ businessCategory: 1, name: 1 });
    
    res.json({
      success: true,
      data: plans
    });
  } catch (error) {

    res.status(500).json({
      success: false,
      message: 'Failed to fetch plans'
    });
  }
});

// @route   GET /api/admin/plans/:id
// @desc    Get plan by ID
// @access  Private/Admin
router.get('/plans/:id', async (req, res) => {
  try {
    const plan = await Plan.findById(req.params.id);
    
    if (!plan) {
      return res.status(404).json({
        success: false,
        message: 'Plan not found'
      });
    }

    res.json({
      success: true,
      data: plan
    });
  } catch (error) {

    res.status(500).json({
      success: false,
      message: 'Failed to fetch plan'
    });
  }
});

// @route   POST /api/admin/plans
// @desc    Create new plan
// @access  Private/Admin
router.post('/plans', [
  body('name').notEmpty().trim().withMessage('Plan name is required'),
  body('businessCategory').notEmpty().trim().withMessage('Business category is required'),
  body('price').isFloat({ min: 0 }).withMessage('Price must be a positive number'),
  body('duration').isInt({ min: 1 }).withMessage('Duration must be a positive integer (days)'),
  body('originalPrice').optional().isFloat({ min: 0 }).withMessage('Original price must be a positive number'),
  body('billingCycle').optional().isIn(['monthly', 'yearly']).withMessage('Invalid billing cycle'),
  body('featuresList').optional().isArray().withMessage('Features list must be an array'),
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }

    const planData = {
      ...req.body,
      createdBy: req.user.id,
      updatedBy: req.user.id
    };

    const plan = new Plan(planData);
    await plan.save();

    res.status(201).json({
      success: true,
      message: 'Plan created successfully',
      data: plan
    });
  } catch (error) {

    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'Plan with this name and category already exists'
      });
    }
    res.status(500).json({
      success: false,
      message: 'Failed to create plan'
    });
  }
});

// @route   PUT /api/admin/plans/:id
// @desc    Update plan
// @access  Private/Admin
router.put('/plans/:id', [
  body('name').optional().notEmpty().trim().withMessage('Plan name cannot be empty'),
  body('price').optional().isFloat({ min: 0 }).withMessage('Price must be a positive number'),
  body('duration').optional().isInt({ min: 1 }).withMessage('Duration must be a positive integer (days)'),
  body('originalPrice').optional().isFloat({ min: 0 }).withMessage('Original price must be a positive number'),
  body('billingCycle').optional().isIn(['monthly', 'yearly']).withMessage('Invalid billing cycle'),
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }

    const plan = await Plan.findById(req.params.id);
    if (!plan) {
      return res.status(404).json({
        success: false,
        message: 'Plan not found'
      });
    }

    // Update plan
    Object.assign(plan, req.body);
    plan.updatedBy = req.user.id;
    plan.updatedAt = new Date();
    await plan.save();

    res.json({
      success: true,
      message: 'Plan updated successfully',
      data: plan
    });
  } catch (error) {

    res.status(500).json({
      success: false,
      message: 'Failed to update plan'
    });
  }
});

// @route   DELETE /api/admin/plans/:id
// @desc    Delete plan (hard delete - permanently remove from database)
// @access  Private/Admin
router.delete('/plans/:id', async (req, res) => {
  try {
    const plan = await Plan.findById(req.params.id);
    if (!plan) {
      return res.status(404).json({
        success: false,
        message: 'Plan not found'
      });
    }

    // Check if plan is custom and if user has permission
    if (plan.isCustom) {
      const isMasterAdmin = req.user.isMasterAdmin === true || 
                           req.user.email === 'rudranshdevelopment@gmail.com';
      if (!isMasterAdmin) {
        return res.status(403).json({
          success: false,
          message: 'Only master admin can delete custom plans'
        });
      }
    }

    // Hard delete - permanently remove from database
    await Plan.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: 'Plan deleted successfully'
    });
  } catch (error) {

    res.status(500).json({
      success: false,
      message: 'Failed to delete plan',
      error: error.message
    });
  }
});

// ==================== CUSTOM PLANS MANAGEMENT ====================

// @route   POST /api/admin/plans/custom
// @desc    Create custom plan for specific user (Master Admin only)
// @access  Private/Master Admin
router.post('/plans/custom', [
  body('name').notEmpty().trim().withMessage('Plan name is required'),
  body('businessCategory').isIn(['Food Mall', 'Retail / E-Commerce Businesses', 'Creative & Design', 'All']).withMessage('Invalid business category'),
  body('price').isFloat({ min: 0 }).withMessage('Price must be a positive number'),
  body('assignedToUser').notEmpty().withMessage('User assignment is required for custom plans'),
  body('customPricing.enabled').optional().isBoolean(),
  body('customPricing.overridePrice').optional().isFloat({ min: 0 }),
  body('customPricing.discountPercent').optional().isFloat({ min: 0, max: 100 }),
], async (req, res) => {
  try {
    // Check if user is master admin
    const isMasterAdmin = req.user.isMasterAdmin === true || 
                         req.user.email === 'rudranshdevelopment@gmail.com';
    
    if (!isMasterAdmin) {
      return res.status(403).json({
        success: false,
        message: 'Only master admin can create custom plans'
      });
    }

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }

    // Verify assigned user exists
    const User = (await import('../models/User.js')).default;
    const assignedUser = await User.findById(req.body.assignedToUser);
    if (!assignedUser) {
      return res.status(404).json({
        success: false,
        message: 'Assigned user not found'
      });
    }

    const planData = {
      ...req.body,
      isCustom: true,
      createdBy: req.user.id,
      updatedBy: req.user.id
    };

    const plan = new Plan(planData);
    await plan.save();

    // Populate assigned user details
    await plan.populate('assignedToUser', 'name email');

    res.status(201).json({
      success: true,
      message: `Custom plan created successfully for ${assignedUser.name}`,
      data: plan
    });
  } catch (error) {

    res.status(500).json({
      success: false,
      message: 'Failed to create custom plan'
    });
  }
});

// @route   GET /api/admin/plans/custom/user/:userId
// @desc    Get all custom plans for a specific user
// @access  Private/Master Admin
router.get('/plans/custom/user/:userId', async (req, res) => {
  try {
    const isMasterAdmin = req.user.isMasterAdmin === true || 
                         req.user.email === 'rudranshdevelopment@gmail.com';
    
    if (!isMasterAdmin) {
      return res.status(403).json({
        success: false,
        message: 'Only master admin can view custom plans'
      });
    }

    const customPlans = await Plan.find({
      isCustom: true,
      assignedToUser: req.params.userId,
      isActive: true
    })
      .populate('assignedToUser', 'name email')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      data: customPlans,
      count: customPlans.length
    });
  } catch (error) {

    res.status(500).json({
      success: false,
      message: 'Failed to fetch custom plans'
    });
  }
});

// @route   GET /api/admin/plans/all-with-custom
// @desc    Get all plans including custom plans with user details (Master Admin only)
// @access  Private/Master Admin
router.get('/plans/all-with-custom', async (req, res) => {
  try {
    const isMasterAdmin = req.user.isMasterAdmin === true || 
                         req.user.email === 'rudranshdevelopment@gmail.com';
    
    if (!isMasterAdmin) {
      return res.status(403).json({
        success: false,
        message: 'Only master admin can view all custom plans'
      });
    }

    const { businessCategory, isActive } = req.query;
    const query = {};
    
    if (businessCategory) {
      query.businessCategory = businessCategory;
    }
    if (isActive !== undefined) {
      query.isActive = isActive === 'true';
    }

    const plans = await Plan.find(query)
      .populate('assignedToUser', 'name email')
      .sort({ isCustom: -1, businessCategory: 1, name: 1 });

    // Separate regular and custom plans
    const regularPlans = plans.filter(p => !p.isCustom);
    const customPlans = plans.filter(p => p.isCustom);

    res.json({
      success: true,
      data: plans,
      regularPlans,
      customPlans,
      stats: {
        total: plans.length,
        regular: regularPlans.length,
        custom: customPlans.length
      }
    });
  } catch (error) {

    res.status(500).json({
      success: false,
      message: 'Failed to fetch plans'
    });
  }
});

// ==================== PLAN RESET & RECREATION ====================

// @route   POST /api/admin/plans/reset-and-create
// @desc    Delete all existing plans and create new professional plans (Master Admin only)
// @access  Private/Master Admin
router.post('/plans/reset-and-create', async (req, res) => {
  try {
    // Check if user is authenticated
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }

    // Check if user is master admin
    const isMasterAdmin = req.user.isMasterAdmin === true || 
                         req.user.email === 'rudranshdevelopment@gmail.com';
    
    if (!isMasterAdmin) {
      return res.status(403).json({
        success: false,
        message: 'Only master admin can reset and create plans'
      });
    }

    // Import BusinessCategory model
    let BusinessCategory;
    try {
      const BusinessCategoryModule = await import('../models/BusinessCategory.js');
      BusinessCategory = BusinessCategoryModule.default;
    } catch (importError) {

      throw new Error('Failed to import BusinessCategory model: ' + importError.message);
    }

    // Fetch all active business categories from database
    const categories = await BusinessCategory.find({ isActive: true })
      .sort({ order: 1, name: 1 });

    if (categories.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No active business categories found in database. Please seed business categories first.'
      });
    }

    // Get master admin user (User model is already imported at top)
    let masterAdmin = await User.findById(req.user.id);
    if (!masterAdmin) {
      masterAdmin = await User.findOne({ 
        $or: [
          { isMasterAdmin: true },
          { email: 'rudranshdevelopment@gmail.com' }
        ]
      });
    }

    // Delete all existing plans (except custom plans)
    const deleteResult = await Plan.deleteMany({ isCustom: { $ne: true } });

    // Plan template generator
    const generatePlansForCategory = (categoryName, categoryDescription) => {
      const categoryLower = categoryName.toLowerCase();
      
      let planConfig = {
        itemType: 'items',
        scanType: 'QR scans',
        basePrice: 499,
        baseOriginalPrice: 999,
        priceMultiplier: 1,
      };

      if (categoryLower.includes('food') || categoryLower.includes('mall') || categoryLower.includes('restaurant')) {
        planConfig = {
          itemType: 'menu items',
          scanType: 'QR scans',
          basePrice: 499,
          baseOriginalPrice: 999,
          priceMultiplier: 1,
        };
      } else if (categoryLower.includes('retail') || categoryLower.includes('e-commerce') || categoryLower.includes('commerce')) {
        planConfig = {
          itemType: 'products',
          scanType: 'QR scans',
          basePrice: 599,
          baseOriginalPrice: 1199,
          priceMultiplier: 1.2,
        };
      } else if (categoryLower.includes('creative') || categoryLower.includes('design') || categoryLower.includes('portfolio')) {
        planConfig = {
          itemType: 'portfolio items',
          scanType: 'QR scans',
          basePrice: 399,
          baseOriginalPrice: 799,
          priceMultiplier: 0.8,
        };
      } else if (categoryLower.includes('service') || categoryLower.includes('professional')) {
        planConfig = {
          itemType: 'services',
          scanType: 'QR scans',
          basePrice: 449,
          baseOriginalPrice: 899,
          priceMultiplier: 0.9,
        };
      } else if (categoryLower.includes('health') || categoryLower.includes('medical') || categoryLower.includes('wellness')) {
        planConfig = {
          itemType: 'services',
          scanType: 'QR scans',
          basePrice: 699,
          baseOriginalPrice: 1399,
          priceMultiplier: 1.4,
        };
      }

      const { itemType, scanType, basePrice, baseOriginalPrice, priceMultiplier } = planConfig;

      return [
        {
          name: "Starter",
          description: `Perfect for small ${categoryName.toLowerCase()} businesses just starting out. Get essential features and ${scanType.toLowerCase()} to grow your business.`,
          price: Math.round(basePrice * priceMultiplier),
          originalPrice: Math.round(baseOriginalPrice * priceMultiplier),
          duration: 30,
          billingCycle: "monthly",
          isDefault: true,
          features: {
            menuItemsLimit: categoryLower.includes('creative') || categoryLower.includes('design') ? "30" : categoryLower.includes('retail') ? "100" : "50",
            qrScansLimit: categoryLower.includes('creative') || categoryLower.includes('design') ? "500" : categoryLower.includes('retail') ? "2000" : "1000",
            analytics: true,
            customDomain: false,
            prioritySupport: false,
            apiAccess: false,
            customBranding: false
          },
          featuresList: [
            `Up to ${categoryLower.includes('creative') || categoryLower.includes('design') ? '30' : categoryLower.includes('retail') ? '100' : '50'} ${itemType}`,
            `${categoryLower.includes('creative') || categoryLower.includes('design') ? '500' : categoryLower.includes('retail') ? '2,000' : '1,000'} ${scanType} per month`,
            "Basic analytics dashboard",
            `Digital ${categoryLower.includes('retail') ? 'catalog' : categoryLower.includes('creative') ? 'portfolio' : 'menu'} QR code`,
            "Mobile-responsive design",
            "Email support",
            `${categoryLower.includes('retail') ? 'Product' : categoryLower.includes('creative') ? 'Portfolio' : 'Menu'} categories`,
            categoryLower.includes('retail') 
              ? "Product images (up to 3 per product)" 
              : categoryLower.includes('creative') 
                ? "Project images (up to 10 per project)" 
                : "Item images (up to 5 per item)",
            categoryLower.includes('retail') ? "Price management" : categoryLower.includes('creative') ? "Project descriptions" : "Menu sections",
            categoryLower.includes('retail') ? "Stock status display" : categoryLower.includes('creative') ? "Contact form" : "Basic customization"
          ]
        },
        {
          name: "Professional",
          description: `Ideal for growing ${categoryName.toLowerCase()} businesses. Advanced features for better customer engagement and business management.`,
          price: Math.round(basePrice * 2.6 * priceMultiplier),
          originalPrice: Math.round(baseOriginalPrice * 2.5 * priceMultiplier),
          duration: 30,
          billingCycle: "monthly",
          isDefault: false,
          features: {
            menuItemsLimit: categoryLower.includes('creative') || categoryLower.includes('design') ? "150" : categoryLower.includes('retail') ? "500" : "200",
            qrScansLimit: categoryLower.includes('creative') || categoryLower.includes('design') ? "5000" : categoryLower.includes('retail') ? "20000" : "10000",
            analytics: true,
            customDomain: true,
            prioritySupport: true,
            apiAccess: false,
            customBranding: true
          },
          featuresList: [
            `Up to ${categoryLower.includes('creative') || categoryLower.includes('design') ? '150' : categoryLower.includes('retail') ? '500' : '200'} ${itemType}`,
            `${categoryLower.includes('creative') || categoryLower.includes('design') ? '5,000' : categoryLower.includes('retail') ? '20,000' : '10,000'} ${scanType} per month`,
            "Advanced analytics & insights",
            "Custom domain support",
            "Custom branding & logo",
            "Priority email support",
            `Unlimited ${categoryLower.includes('retail') ? 'product' : categoryLower.includes('creative') ? 'portfolio' : 'menu'} categories`,
            `${categoryLower.includes('retail') ? 'Product' : categoryLower.includes('creative') ? 'Project' : 'Item'} images (unlimited)`,
            categoryLower.includes('retail') 
              ? "Product variants & options" 
              : categoryLower.includes('creative') 
                ? "Video portfolio support" 
                : "Menu sections & specials",
            categoryLower.includes('retail') 
              ? "E-commerce integration" 
              : categoryLower.includes('creative') 
                ? "Client testimonials" 
                : "Online ordering integration",
            categoryLower.includes('retail') 
              ? "Shopping cart functionality" 
              : categoryLower.includes('creative') 
                ? "Case study pages" 
                : "Customer reviews & ratings",
            "Social media integration",
            categoryLower.includes('retail') ? "Inventory management" : categoryLower.includes('creative') ? "Blog integration" : "Advanced customization"
          ]
        },
        {
          name: "Enterprise",
          description: `Complete solution for large ${categoryName.toLowerCase()} businesses and chains. All features, integrations, and white-label options included.`,
          price: Math.round(basePrice * 6 * priceMultiplier),
          originalPrice: Math.round(baseOriginalPrice * 6 * priceMultiplier),
          duration: 30,
          billingCycle: "monthly",
          isDefault: false,
          features: {
            menuItemsLimit: "unlimited",
            qrScansLimit: "unlimited",
            analytics: true,
            customDomain: true,
            prioritySupport: true,
            apiAccess: true,
            customBranding: true
          },
          featuresList: [
            `Unlimited ${itemType}`,
            `Unlimited ${scanType}`,
            "Enterprise analytics & reports",
            "Custom domain & SSL",
            "Full custom branding",
            "24/7 priority support",
            "API access & webhooks",
            categoryLower.includes('retail') 
              ? "Multi-store management" 
              : categoryLower.includes('creative') 
                ? "Multi-brand management" 
                : "Multi-location management",
            categoryLower.includes('retail') 
              ? "Advanced inventory system" 
              : categoryLower.includes('creative') 
                ? "Client management system" 
                : "Staff management system",
            categoryLower.includes('retail') 
              ? "Order management system" 
              : categoryLower.includes('creative') 
                ? "Project collaboration tools" 
                : "Inventory tracking",
            categoryLower.includes('retail') 
              ? "Payment gateway integration" 
              : categoryLower.includes('creative') 
                ? "Invoice & billing integration" 
                : "Advanced ordering system",
            categoryLower.includes('retail') 
              ? "Shipping management" 
              : categoryLower.includes('creative') 
                ? "Time tracking integration" 
                : "Loyalty program integration",
            "Marketing automation",
            "White-label solution",
            categoryLower.includes('creative') ? "Team member accounts" : "Advanced integrations"
          ]
        }
      ];
    };

    // Create plans for each category
    let totalCreated = 0;
    const createdPlans = [];
    const errors = [];

    for (const category of categories) {
      try {
        const plans = generatePlansForCategory(category.name, category.description || '');

        for (const planData of plans) {
          try {
            const plan = new Plan({
              name: planData.name,
              description: planData.description,
              price: planData.price,
              originalPrice: planData.originalPrice,
              duration: planData.duration,
              billingCycle: planData.billingCycle,
              isDefault: planData.isDefault,
              businessCategory: category.name,
              features: planData.features,
              featuresList: planData.featuresList,
              isActive: true,
              isCustom: false,
              createdBy: masterAdmin?._id || null,
              updatedBy: masterAdmin?._id || null,
              currency: 'INR'
            });

            await plan.save();
            totalCreated++;
            createdPlans.push({
              name: planData.name,
              category: category.name,
              price: planData.price
            });

          } catch (planError) {

            errors.push({
              category: category.name,
              plan: planData.name,
              error: planError.message
            });
          }
        }
      } catch (categoryError) {

        errors.push({
          category: category.name,
          error: categoryError.message
        });
      }
    }

    if (totalCreated === 0 && errors.length > 0) {
      throw new Error(`Failed to create any plans. Errors: ${JSON.stringify(errors)}`);
    }

    res.json({
      success: true,
      message: `Successfully reset and created ${totalCreated} professional plans across ${categories.length} categories`,
      data: {
        totalCreated,
        deletedCount: deleteResult.deletedCount,
        categories: categories.map(cat => ({
          category: cat.name,
          count: 3
        })),
        plans: createdPlans,
        ...(errors.length > 0 && { errors, warning: `${errors.length} errors occurred during plan creation` })
      }
    });
  } catch (error) {


    res.status(500).json({
      success: false,
      message: 'Failed to reset and create plans',
      error: error.message || 'Unknown error occurred',
      ...(process.env.NODE_ENV === 'development' && { stack: error.stack })
    });
  }
});

// ==================== SUBSCRIPTIONS & PAYMENTS MANAGEMENT ====================

// @route   GET /api/admin/subscriptions
// @desc    Get all subscriptions with filters
// @access  Private/Admin
router.get('/subscriptions', async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 20, 
      status, 
      plan, 
      businessCategory,
      search 
    } = req.query;

    const query = { isArchived: { $ne: true } };

    if (status) {
      if (status === 'expired') {
        query.$and = query.$and || [];
        query.$and.push({
          $or: [
            { 'subscription.status': 'expired' },
            { 'subscription.endDate': { $lt: new Date() } }
          ]
        });
      } else {
        query['subscription.status'] = status;
      }
    }
    if (plan) {
      query['subscription.plan'] = plan;
    }
    if (businessCategory) {
      query.businessCategory = businessCategory;
    }
    if (search) {
      query.$and = query.$and || [];
      query.$and.push({
        $or: [
          { name: { $regex: search, $options: 'i' } },
          { email: { $regex: search, $options: 'i' } }
        ]
      });
    }

    const restaurants = await Restaurant.find(query)
      .select('name email businessCategory businessType subscription logo createdAt')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .lean();

    const total = await Restaurant.countDocuments(query);

    const enriched = restaurants.map((r) => ({
      ...r,
      subscription: r.subscription ? enrichSubscriptionFromEndDate(r.subscription) : r.subscription
    }));

    res.json({
      success: true,
      data: enriched,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {

    res.status(500).json({
      success: false,
      message: 'Failed to fetch subscriptions'
    });
  }
});

// Helper function to mark old pending payments as failed
async function markOldPendingPaymentsAsFailed() {
  try {
    const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    
    const result = await Payment.updateMany(
      { 
        status: 'pending',
        createdAt: { $lt: twentyFourHoursAgo },
        razorpayPaymentId: null
      },
      { 
        $set: { 
          status: 'failed',
          failureReason: 'Payment timeout: Payment was not completed within 24 hours',
          updatedAt: new Date()
        }
      }
    );

  } catch (_error) {}
}

// @route   GET /api/admin/payments
// @desc    Get all payments with filters
// @access  Private/Admin
router.get('/payments', async (req, res) => {
  try {
    // Mark old pending payments as failed before fetching
    await markOldPendingPaymentsAsFailed();

    const { 
      page = 1, 
      limit = 20, 
      status, 
      plan, 
      businessCategory,
      startDate,
      endDate
    } = req.query;

    const query = {};
    
    if (status && status !== 'all') {
      query.status = status;
    }
    if (plan) {
      query.plan = plan;
    }
    if (businessCategory) {
      query.businessCategory = businessCategory;
    }
    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) {
        query.createdAt.$gte = new Date(startDate);
      }
      if (endDate) {
        query.createdAt.$lte = new Date(endDate);
      }
    }

    const payments = await Payment.find(query)
      .populate('restaurant', 'name email businessCategory businessType logo')
      .populate('user', 'name email')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Payment.countDocuments(query);

    // Calculate totals
    const totalRevenue = await Payment.aggregate([
      { $match: { ...query, status: 'completed' } },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);

    res.json({
      success: true,
      data: payments,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      },
      totals: {
        revenue: totalRevenue[0]?.total || 0,
        count: total
      }
    });
  } catch (error) {

    res.status(500).json({
      success: false,
      message: 'Failed to fetch payments'
    });
  }
});

// @route   GET /api/admin/brochure-downloads
// @desc    List who downloaded brochure (for admin dashboard)
// @access  Private/Admin
router.get('/brochure-downloads', async (req, res) => {
  try {
    const { page = 1, limit = 50, search } = req.query;
    const skip = (Math.max(1, parseInt(page)) - 1) * Math.min(100, Math.max(1, parseInt(limit)));

    const query = {};
    if (search && String(search).trim()) {
      const s = String(search).trim();
      query.$or = [
        { name: { $regex: s, $options: 'i' } },
        { email: { $regex: s, $options: 'i' } },
        { mobile: { $regex: s, $options: 'i' } },
      ];
    }

    const [list, total] = await Promise.all([
      BrochureDownload.find(query).sort({ createdAt: -1 }).skip(skip).limit(Math.min(100, Math.max(1, parseInt(limit)))).lean(),
      BrochureDownload.countDocuments(query),
    ]);

    res.json({
      success: true,
      data: list,
      pagination: {
        page: Math.max(1, parseInt(page)),
        limit: Math.min(100, Math.max(1, parseInt(limit))),
        total,
        pages: Math.ceil(total / Math.min(100, Math.max(1, parseInt(limit)))),
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch brochure downloads',
    });
  }
});

// @route   GET /api/admin/renewals
// @desc    Get upcoming renewals (subscriptions expiring in the next N days)
// @access  Private/Admin
router.get('/renewals', async (req, res) => {
  try {
    const { days = 30 } = req.query;
    const now = new Date();
    const futureDate = new Date(now);
    futureDate.setDate(futureDate.getDate() + parseInt(days));

    const restaurants = await Restaurant.find({
      isArchived: { $ne: true },
      'subscription.endDate': { $exists: true, $ne: null, $gte: now, $lte: futureDate }
    })
      .select('name email businessCategory businessType subscription logo')
      .sort({ 'subscription.endDate': 1 })
      .lean();

    const daysWindow = Math.min(365, Math.max(1, parseInt(days)));
    const enriched = restaurants
      .map((r) => ({
        ...r,
        subscription: r.subscription ? enrichSubscriptionFromEndDate(r.subscription) : r.subscription
      }))
      .filter((r) => {
        const daysRem = r.subscription?.daysRemaining ?? 0;
        return daysRem >= 0 && daysRem <= daysWindow;
      });

    res.json({
      success: true,
      data: enriched,
      count: enriched.length
    });
  } catch (error) {

    res.status(500).json({
      success: false,
      message: 'Failed to fetch renewals'
    });
  }
});

// ==================== SEED PLANS ====================

// @route   POST /api/admin/plans/seed
// @desc    Seed default plans into database
// @access  Private/Admin
router.post('/plans/seed', async (req, res) => {
  try {
    const plans = [
      // Food Mall Plans
      {
        name: 'Starter Menu Plan',
        businessCategory: 'Food Mall',
        price: 399,
        originalPrice: 499,
        currency: 'INR',
        billingCycle: 'monthly',
        features: {
          menuItemsLimit: '50',
          qrScansLimit: '1000',
          analytics: true,
          customDomain: false,
          prioritySupport: false,
          apiAccess: false,
          customBranding: true,
        },
        description: 'Perfect for small restaurants and cafes just starting out',
        isActive: true,
        isDefault: false,
      },
      {
        name: 'Growth Menu Plan',
        businessCategory: 'Food Mall',
        price: 599,
        originalPrice: 799,
        currency: 'INR',
        billingCycle: 'monthly',
        features: {
          menuItemsLimit: '200',
          qrScansLimit: '5000',
          analytics: true,
          customDomain: true,
          prioritySupport: true,
          apiAccess: false,
          customBranding: true,
        },
        description: 'Ideal for growing restaurants with expanding menus',
        isActive: true,
        isDefault: false,
      },
      {
        name: 'Pro Restaurant Plan',
        businessCategory: 'Food Mall',
        price: 799,
        originalPrice: 1099,
        currency: 'INR',
        billingCycle: 'monthly',
        features: {
          menuItemsLimit: 'unlimited',
          qrScansLimit: 'unlimited',
          analytics: true,
          customDomain: true,
          prioritySupport: true,
          apiAccess: true,
          customBranding: true,
        },
        description: 'Complete solution for established restaurants and chains',
        isActive: true,
        isDefault: false,
      },
      // Retail / E-Commerce Plans
      {
        name: 'Basic Catalog Plan',
        businessCategory: 'Retail / E-Commerce Businesses',
        price: 499,
        originalPrice: 649,
        currency: 'INR',
        billingCycle: 'monthly',
        features: {
          menuItemsLimit: '100',
          qrScansLimit: '2000',
          analytics: true,
          customDomain: false,
          prioritySupport: false,
          apiAccess: false,
          customBranding: true,
        },
        description: 'Essential features for small retail stores and online shops',
        isActive: true,
        isDefault: false,
      },
      {
        name: 'Business Catalog Plan',
        businessCategory: 'Retail / E-Commerce Businesses',
        price: 599,
        originalPrice: 799,
        currency: 'INR',
        billingCycle: 'monthly',
        features: {
          menuItemsLimit: '300',
          qrScansLimit: '10000',
          analytics: true,
          customDomain: true,
          prioritySupport: true,
          apiAccess: false,
          customBranding: true,
        },
        description: 'Advanced features for growing retail businesses',
        isActive: true,
        isDefault: false,
      },
      {
        name: 'Retail Pro Catalog Plan',
        businessCategory: 'Retail / E-Commerce Businesses',
        price: 699,
        originalPrice: 999,
        currency: 'INR',
        billingCycle: 'monthly',
        features: {
          menuItemsLimit: 'unlimited',
          qrScansLimit: 'unlimited',
          analytics: true,
          customDomain: true,
          prioritySupport: true,
          apiAccess: true,
          customBranding: true,
        },
        description: 'Premium solution for large retail operations and e-commerce stores',
        isActive: true,
        isDefault: false,
      },
      // Creative & Design Plans
      {
        name: 'Launch Store Plan',
        businessCategory: 'Creative & Design',
        price: 299,
        originalPrice: 399,
        currency: 'INR',
        billingCycle: 'monthly',
        features: {
          menuItemsLimit: '30',
          qrScansLimit: '500',
          analytics: true,
          customDomain: false,
          prioritySupport: false,
          apiAccess: false,
          customBranding: true,
        },
        description: 'Perfect for freelancers and small creative businesses',
        isActive: true,
        isDefault: false,
      },
      {
        name: 'Growth Store Plan',
        businessCategory: 'Creative & Design',
        price: 499,
        originalPrice: 699,
        currency: 'INR',
        billingCycle: 'monthly',
        features: {
          menuItemsLimit: '150',
          qrScansLimit: '3000',
          analytics: true,
          customDomain: true,
          prioritySupport: true,
          apiAccess: false,
          customBranding: true,
        },
        description: 'Ideal for growing creative agencies and design studios',
        isActive: true,
        isDefault: false,
      },
      {
        name: 'Scale Store Plan',
        businessCategory: 'Creative & Design',
        price: 699,
        originalPrice: 949,
        currency: 'INR',
        billingCycle: 'monthly',
        features: {
          menuItemsLimit: 'unlimited',
          qrScansLimit: 'unlimited',
          analytics: true,
          customDomain: true,
          prioritySupport: true,
          apiAccess: true,
          customBranding: true,
        },
        description: 'Complete solution for established creative agencies and large design firms',
        isActive: true,
        isDefault: false,
      },
    ];

    const results = {
      created: [],
      updated: [],
      errors: []
    };

    for (const planData of plans) {
      try {
        // Check if plan already exists
        const existingPlan = await Plan.findOne({
          name: planData.name,
          businessCategory: planData.businessCategory,
        });

        if (existingPlan) {
          // Update existing plan
          Object.assign(existingPlan, planData);
          existingPlan.updatedBy = req.user.id;
          existingPlan.updatedAt = new Date();
          await existingPlan.save();
          results.updated.push({
            name: planData.name,
            category: planData.businessCategory
          });
        } else {
          // Create new plan
          const plan = new Plan({
            ...planData,
            createdBy: req.user.id,
            updatedBy: req.user.id
          });
          await plan.save();
          results.created.push({
            name: planData.name,
            category: planData.businessCategory
          });
        }
      } catch (error) {

        results.errors.push({
          name: planData.name,
          category: planData.businessCategory,
          error: error.message
        });
      }
    }

    res.json({
      success: true,
      message: `Plans seeded successfully. Created: ${results.created.length}, Updated: ${results.updated.length}`,
      results
    });
  } catch (error) {

    res.status(500).json({
      success: false,
      message: 'Failed to seed plans',
      error: error.message
    });
  }
});

// ==================== BULK EMAIL ROUTES ====================

// Multer for email attachments (images, PDF, docs)
const emailAttachmentStorage = multer.memoryStorage();
const emailAttachmentUpload = multer({
  storage: emailAttachmentStorage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB per file
  fileFilter: (req, file, cb) => {
    const allowed = [
      'image/jpeg', 'image/png', 'image/gif', 'image/webp',
      'application/pdf',
      'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    ];
    if (allowed.includes(file.mimetype)) cb(null, true);
    else cb(new Error(`File type ${file.mimetype} not allowed`), false);
  },
});

// @route   GET /api/admin/emails/options
// @desc    Get filter options for bulk email (categories, subscription statuses)
// @access  Private/Admin
router.get('/emails/options', async (req, res) => {
  try {
    const categories = await BusinessCategory.find({ isActive: true })
      .sort({ order: 1, name: 1 })
      .select('name')
      .lean();
    res.json({
      success: true,
      data: {
        businessCategories: categories.map(c => c.name),
        subscriptionStatuses: ['active', 'inactive', 'expired', 'cancelled'],
        roles: ['user'],
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch email options',
      error: error.message,
    });
  }
});

// @route   GET /api/admin/emails/recipients
// @desc    Get recipients for bulk email (counts and preview)
// @access  Private/Admin
router.get('/emails/recipients', async (req, res) => {
  try {
    const { role, businessCategory, subscriptionStatus, limit = 100, recipientType = 'all' } = req.query;

    const userQuery = { role: { $ne: 'admin' } };
    if (role && role !== 'all') userQuery.role = role;

    const restaurantQuery = { $or: [{ isArchived: false }, { isArchived: { $exists: false } }] };
    if (businessCategory && businessCategory !== 'all') {
      restaurantQuery.businessCategory = businessCategory;
    }
    if (subscriptionStatus && subscriptionStatus !== 'all') {
      restaurantQuery['subscription.status'] = subscriptionStatus;
    }

    const includeUsers = recipientType === 'all' || recipientType === 'users';
    const includeBusinesses = recipientType === 'all' || recipientType === 'businesses';

    const [userCount, restaurantCount, userEmails, restaurantEmails] = await Promise.all([
      includeUsers ? User.countDocuments(userQuery) : 0,
      includeBusinesses ? Restaurant.countDocuments(restaurantQuery) : 0,
      includeUsers ? User.find(userQuery).select('email name').limit(Number(limit)).lean() : [],
      includeBusinesses ? Restaurant.find(restaurantQuery).select('email name').limit(Number(limit)).lean() : [],
    ]);

    const previewEmails = [
      ...userEmails.map(u => ({ email: u.email, name: u.name, source: 'user' })),
      ...restaurantEmails.map(r => ({ email: r.email, name: r.name, source: 'business' })),
    ].slice(0, 50);

    const uniqueEmails = new Set();
    const allUsers = includeUsers ? await User.find(userQuery).select('email').lean() : [];
    const allRestaurants = includeBusinesses ? await Restaurant.find(restaurantQuery).select('email').lean() : [];
    allUsers.forEach(u => uniqueEmails.add((u.email || '').toLowerCase().trim()));
    allRestaurants.forEach(r => uniqueEmails.add((r.email || '').toLowerCase().trim()));
    const totalUniqueCount = uniqueEmails.size;

    res.json({
      success: true,
      data: {
        totalUniqueCount,
        userCount,
        restaurantCount,
        previewEmails,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch recipients',
      error: error.message,
    });
  }
});

// @route   GET /api/admin/emails/history
// @desc    Get bulk email send history (paginated)
// @access  Private/Admin
router.get('/emails/history', async (req, res) => {
  try {
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(50, Math.max(1, parseInt(req.query.limit) || 10));
    const skip = (page - 1) * limit;
    const search = (req.query.search || '').toString().trim();

    const query = {};
    if (search) {
      query.subject = { $regex: search, $options: 'i' };
    }

    const [logs, total] = await Promise.all([
      BulkEmailLog.find(query)
        .populate('sentBy', 'name email')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      BulkEmailLog.countDocuments(query),
    ]);

    res.json({
      success: true,
      data: logs,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch email history',
      error: error.message,
    });
  }
});

// @route   POST /api/admin/emails/bulk
// @desc    Send bulk emails to selected recipients (with optional attachments)
// @access  Private/Admin
router.post('/emails/bulk', emailAttachmentUpload.array('attachments', 5), async (req, res) => {
  try {
    const { subject, htmlBody, recipientType, customEmailsJson, role, businessCategory, subscriptionStatus } = req.body;

    if (!subject || !subject.trim()) {
      return res.status(400).json({ success: false, message: 'Subject is required' });
    }
    if (!htmlBody || !htmlBody.trim()) {
      return res.status(400).json({ success: false, message: 'Email body is required' });
    }
    if (!['all', 'users', 'businesses', 'custom'].includes(recipientType)) {
      return res.status(400).json({ success: false, message: 'Invalid recipient type' });
    }

    let customEmails = [];
    if (recipientType === 'custom' && customEmailsJson) {
      try {
        customEmails = typeof customEmailsJson === 'string' ? JSON.parse(customEmailsJson) : customEmailsJson;
      } catch {
        customEmails = [];
      }
    }

    let emailsToSend = [];

    if (recipientType === 'custom') {
      const normalized = (customEmails || [])
        .map(e => (e || '').toString().toLowerCase().trim())
        .filter(e => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e));
      emailsToSend = [...new Set(normalized)];
    } else {
      const userQuery = { role: { $ne: 'admin' } };
      if (role && role !== 'all') userQuery.role = role;

      const restaurantQuery = { $or: [{ isArchived: false }, { isArchived: { $exists: false } }] };
      if (businessCategory && businessCategory !== 'all') restaurantQuery.businessCategory = businessCategory;
      if (subscriptionStatus && subscriptionStatus !== 'all') {
        restaurantQuery['subscription.status'] = subscriptionStatus;
      }

      const [users, restaurants] = await Promise.all([
        recipientType === 'users' || recipientType === 'all' ? User.find(userQuery).select('email').lean() : [],
        recipientType === 'businesses' || recipientType === 'all' ? Restaurant.find(restaurantQuery).select('email').lean() : [],
      ]);

      const seen = new Set();
      users.forEach(u => {
        const e = (u.email || '').toLowerCase().trim();
        if (e && !seen.has(e)) { seen.add(e); emailsToSend.push(e); }
      });
      restaurants.forEach(r => {
        const e = (r.email || '').toLowerCase().trim();
        if (e && !seen.has(e)) { seen.add(e); emailsToSend.push(e); }
      });
    }

    if (emailsToSend.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No valid recipients found. Please check your filters or add custom emails.',
      });
    }

    if (emailsToSend.length > 500) {
      return res.status(400).json({
        success: false,
        message: 'Maximum 500 recipients per bulk send. Please narrow your filters.',
      });
    }

    const attachments = (req.files || []).map(f => ({
      filename: f.originalname || `attachment_${Date.now()}`,
      content: f.buffer,
    }));

    const html = `
<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="margin:0;padding:0;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;background:#f9fafb;">
  <div style="max-width:600px;margin:0 auto;padding:30px;background:#fff;border-radius:12px;box-shadow:0 2px 8px rgba(0,0,0,0.08);">
    ${htmlBody}
    <hr style="border:none;border-top:1px solid #e5e7eb;margin:24px 0;">
    <p style="margin:0;color:#9ca3af;font-size:12px;">
      © ${new Date().getFullYear()} ScanBit. This email was sent by ScanBit Admin.
    </p>
  </div>
</body>
</html>`;

    let sent = 0;
    let failed = 0;
    const failedEmails = [];

    for (const to of emailsToSend) {
      try {
        const result = await sendEmail(to, subject.trim(), html, attachments);
        if (result.sent) sent++; else { failed++; failedEmails.push(to); }
      } catch (err) {
        failed++;
        failedEmails.push(to);
      }
    }

    // Save to email history
    if (req.user?._id) {
      await BulkEmailLog.create({
        sentBy: req.user._id,
        subject: subject.trim(),
        recipientType,
        filters: {
          role: role && role !== 'all' ? role : null,
          businessCategory: businessCategory && businessCategory !== 'all' ? businessCategory : null,
          subscriptionStatus: subscriptionStatus && subscriptionStatus !== 'all' ? subscriptionStatus : null,
        },
        total: emailsToSend.length,
        sent,
        failed,
        failedEmails: failedEmails.slice(0, 50),
        attachmentCount: attachments.length,
      });
    }

    res.json({
      success: true,
      message: `Bulk email completed. Sent: ${sent}, Failed: ${failed}`,
      data: { sent, failed, total: emailsToSend.length, failedEmails: failedEmails.slice(0, 20) },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to send bulk email',
      error: error.message,
    });
  }
});

export default router;
