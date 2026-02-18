import express from 'express';
import nodemailer from 'nodemailer';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

import Restaurant from '../models/Restaurant.js';
import MenuItem from '../models/MenuItem.js';
import QRScan from '../models/QRScan.js';
import User from '../models/User.js';
import BrochureDownload from '../models/BrochureDownload.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);


const router = express.Router();

// @route   GET /api/public/brochure
// @desc    Serve brochure PDF (for email link fallback when attachment fails)
// @access  Public
router.get('/brochure', (req, res) => {
  const brochureCandidates = [
    process.env.BROCHURE_FILE_PATH ? path.resolve(process.env.BROCHURE_FILE_PATH) : null,
    path.join(process.cwd(), 'ScanBit-Backend/assets/ScanBit_Brochure.pdf'),
    path.join(process.cwd(), 'ScanBit-Backend/assets/Scanbit_brochure.pdf'),
    path.join(process.cwd(), 'ScanBit-Backend/assets/Scanbit_broucher.pdf'),
    path.join(__dirname, '../assets/ScanBit_Brochure.pdf'),
    path.join(__dirname, '../assets/Scanbit_brochure.pdf'),
    path.join(__dirname, '../assets/Scanbit_broucher.pdf'),
    path.join(process.cwd(), 'assets/ScanBit_Brochure.pdf'),
    path.join(process.cwd(), 'assets/Scanbit_brochure.pdf'),
    path.join(process.cwd(), 'assets/Scanbit_broucher.pdf'),
    path.join(process.cwd(), 'ScanBit-Frontend/public/brochure.pdf'),
    path.join(process.cwd(), 'ScanBit-Frontend/public/Scanbit_broucher.pdf'),
    path.join(process.cwd(), 'ScanBit-Frontend/dist/brochure.pdf'),
    path.join(__dirname, '../../ScanBit-Frontend/public/brochure.pdf'),
    path.join(__dirname, '../../ScanBit-Frontend/public/Scanbit_broucher.pdf'),
  ].filter(Boolean);

  for (const p of brochureCandidates) {
    if (fs.existsSync(p)) {
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', 'inline; filename="ScanBit_Brochure.pdf"');
      return res.sendFile(p);
    }
  }
  // Fallback: redirect to BROCHURE_URL (Cloudinary/CDN) when no local file in deployment
  const brochureUrl = process.env.BROCHURE_URL;
  if (brochureUrl && brochureUrl.startsWith('http')) {
    return res.redirect(302, brochureUrl);
  }
  res.status(404).json({ success: false, message: 'Brochure not found' });
});

// @route   GET /api/public/restaurants
// @desc    Get restaurants by category (public, no auth required)
// @access  Public
router.get('/restaurants', async (req, res) => {
  try {
    const { 
      businessCategory, 
      businessType, 
      page = 1, 
      limit = 20, 
      search,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    // Build query
    const query = {
      isArchived: { $ne: true },
      // Only show verified businesses for public view
      verificationStatus: 'verified'
    };

    if (businessCategory && businessCategory !== 'all') {
      query.businessCategory = businessCategory;
    }

    if (businessType && businessType !== 'all') {
      query.businessType = businessType;
    }

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { businessType: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }

    // Build sort
    const sort = {};
    sort[sortBy] = sortOrder === 'asc' ? 1 : -1;

    // Execute query with pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const restaurants = await Restaurant.find(query)
      .populate('owner', 'name email')
      .sort(sort)
      .skip(skip)
      .limit(parseInt(limit))
      .lean();

    const total = await Restaurant.countDocuments(query);

    res.json({
      success: true,
      data: restaurants,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {

    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   GET /api/public/stats
// @desc    Get public statistics for homepage (no auth required)
// @access  Public
router.get('/stats', async (req, res) => {
  try {
    // Get total businesses (verified only for public display)
    const totalBusinesses = await Restaurant.countDocuments({
      verificationStatus: 'verified',
      isArchived: false,
      'subscription.status': 'active'
    });

    // Get total users (excluding admins)
    const totalUsers = await User.countDocuments({ 
      role: { $ne: 'admin' },
      isActive: { $ne: false }
    });

    // Get total QR scans
    const totalQRScans = await QRScan.countDocuments();

    // Get total menu items (from active restaurants)
    const activeRestaurants = await Restaurant.find({
      verificationStatus: 'verified',
      isArchived: false,
      'subscription.status': 'active'
    }).select('_id');

    const restaurantIds = activeRestaurants.map(r => r._id);
    const totalMenuItems = await MenuItem.countDocuments({
      restaurant: { $in: restaurantIds },
      isAvailable: true
    });

    // Get businesses by category
    const businessesByCategory = await Restaurant.aggregate([
      {
        $match: {
          verificationStatus: 'verified',
          isArchived: false,
          'subscription.status': 'active'
        }
      },
      {
        $group: {
          _id: '$businessCategory',
          count: { $sum: 1 }
        }
      }
    ]);

    // Get recent businesses (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const newBusinesses = await Restaurant.countDocuments({
      verificationStatus: 'verified',
      isArchived: false,
      createdAt: { $gte: thirtyDaysAgo }
    });

    // Calculate average menu items per restaurant
    const avgMenuItems = totalBusinesses > 0 
      ? Math.round(totalMenuItems / totalBusinesses) 
      : 0;

    // Get total scans this month
    const thisMonth = new Date();
    thisMonth.setDate(1);
    thisMonth.setHours(0, 0, 0, 0);
    const scansThisMonth = await QRScan.countDocuments({
      scannedAt: { $gte: thisMonth }
    });

    // Calculate satisfaction rate (based on active subscriptions and verified businesses)
    // Higher satisfaction if more businesses are active and verified
    // Base satisfaction on the ratio of active businesses to total users
    // If most users have active businesses, satisfaction is high
    const activeBusinessRatio = totalUsers > 0 ? totalBusinesses / totalUsers : 0;
    const satisfactionRate = totalBusinesses > 0 
      ? Math.min(98, Math.max(88, Math.round(88 + (activeBusinessRatio * 10))))
      : 90;

    // Setup time is typically 5 minutes (hardcoded as it's a platform feature)
    const setupTime = 5;

    res.json({
      success: true,
      data: {
        // Main stats for homepage
        totalRestaurants: totalBusinesses,
        totalScans: totalQRScans,
        satisfaction: satisfactionRate,
        setupTime: setupTime,
        // Additional data
        totalBusinesses,
        totalUsers,
        totalMenuItems,
        newBusinesses,
        avgMenuItems,
        scansThisMonth,
        businessesByCategory: businessesByCategory.reduce((acc, item) => {
          acc[item._id || 'Other'] = item.count;
          return acc;
        }, {})
      }
    });
  } catch (error) {

    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   GET /api/public/featured-businesses
// @desc    Get a curated list of verified businesses with logos for public display
// @access  Public
router.get('/featured-businesses', async (req, res) => {
  try {
    const limit = Math.min(parseInt(req.query.limit, 10) || 12, 50); // hard cap to avoid large payloads

    const businesses = await Restaurant.find({
      verificationStatus: 'verified',
      isArchived: false,
      'subscription.status': 'active',
      $or: [
        { logo: { $exists: true, $ne: '' } },
        { ownerImage: { $exists: true, $ne: '' } },
        { profileImage: { $exists: true, $ne: '' } },
      ],
    })
      .sort({ createdAt: -1 })
      .limit(limit)
      .select('name businessName restaurantName logo ownerImage profileImage businessType businessCategory city country createdAt');

    const sanitized = businesses.map((biz) => ({
      id: biz._id,
      name: biz.name || biz.businessName || biz.restaurantName || 'Business',
      logo: biz.logo || biz.ownerImage || biz.profileImage || '',
      businessType: biz.businessType || '',
      businessCategory: biz.businessCategory || '',
      location: [biz.city, biz.country].filter(Boolean).join(', '),
      createdAt: biz.createdAt,
    }));

    res.json({
      success: true,
      data: sanitized,
      count: sanitized.length,
    });
  } catch (error) {

    res.status(500).json({
      success: false,
      message: 'Server error',
    });
  }
});

// @route   POST /api/public/download-brochure
// @desc    Send brochure PDF to user's email
// @access  Public
router.post('/download-brochure', async (req, res) => {
  try {
    const { name, email, mobile } = req.body;

    if (!name || !email || !mobile) {
      return res.status(400).json({
        success: false,
        message: 'Name, email, and mobile number are required'
      });
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid email address'
      });
    }

    // Mobile validation
    const mobileRegex = /^[0-9]{10}$/;
    if (!mobileRegex.test(mobile.replace(/\D/g, ''))) {
      return res.status(400).json({
        success: false,
        message: 'Invalid mobile number'
      });
    }

    // Configure nodemailer transporter
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: false,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    // Brochure: attach PDF or send link to GET /api/public/brochure
    const protocol = req.get('x-forwarded-proto') || req.protocol || 'https';
    const host = req.get('x-forwarded-host') || req.get('host') || 'scanbit.in';
    const baseUrl = `${protocol}://${host}`;
    const BROCHURE_PUBLIC_URL =
      process.env.BROCHURE_PUBLIC_URL ||
      `${baseUrl}/api/public/brochure`;

    // Save brochure download to DB for admin dashboard
    const brochureRecord = await BrochureDownload.create({
      name: name.trim(),
      email: email.trim().toLowerCase(),
      mobile: (mobile || '').replace(/\D/g, '').slice(0, 15),
      ip: (req.headers['x-forwarded-for'] || req.socket?.remoteAddress || '').toString().split(',')[0].trim(),
      userAgent: (req.headers['user-agent'] || '').slice(0, 500),
    });

    const brochureFileCandidates = [
      process.env.BROCHURE_FILE_PATH ? path.resolve(process.env.BROCHURE_FILE_PATH) : null,
      path.join(process.cwd(), 'ScanBit-Backend/assets/ScanBit_Brochure.pdf'),
      path.join(process.cwd(), 'ScanBit-Backend/assets/Scanbit_brochure.pdf'),
      path.join(process.cwd(), 'ScanBit-Backend/assets/Scanbit_broucher.pdf'),
      path.join(__dirname, '../assets/ScanBit_Brochure.pdf'),
      path.join(__dirname, '../assets/Scanbit_brochure.pdf'),
      path.join(__dirname, '../assets/Scanbit_broucher.pdf'),
      path.join(__dirname, '../../assets/ScanBit_Brochure.pdf'),
      path.join(__dirname, '../../assets/Scanbit_brochure.pdf'),
      path.join(__dirname, '../../assets/Scanbit_broucher.pdf'),
      path.join(process.cwd(), 'assets/ScanBit_Brochure.pdf'),
      path.join(process.cwd(), 'assets/Scanbit_brochure.pdf'),
      path.join(process.cwd(), 'assets/Scanbit_broucher.pdf'),
      path.join(process.cwd(), 'ScanBit-Frontend/public/ScanBit_Brochure.pdf'),
      path.join(process.cwd(), 'ScanBit-Frontend/public/Scanbit_brochure.pdf'),
      path.join(process.cwd(), 'ScanBit-Frontend/public/Scanbit_broucher.pdf'),
      path.join(__dirname, '../../ScanBit-Frontend/public/ScanBit_Brochure.pdf'),
      path.join(__dirname, '../../ScanBit-Frontend/public/Scanbit_brochure.pdf'),
      path.join(__dirname, '../../ScanBit-Frontend/public/Scanbit_broucher.pdf'),
      path.join(__dirname, '../../ScanBit-Frontend/src/assets/Scanbit_broucher.pdf'),
      path.join(__dirname, '../../ScanBit-Frontend/dist/assets/Scanbit_broucher.pdf'),
    ].filter(Boolean);
    
    let brochureFile = null;
    let brochurePath = null;
    
    for (const testPath of brochureFileCandidates) {
      if (fs.existsSync(testPath)) {
        brochurePath = testPath;
        brochureFile = fs.readFileSync(testPath);
        break;
      }
    }

    // Fallback: fetch PDF from BROCHURE_URL (Cloudinary/CDN) when no local file in deployment
    if (!brochureFile && process.env.BROCHURE_URL && process.env.BROCHURE_URL.startsWith('http')) {
      try {
        const fetchRes = await fetch(process.env.BROCHURE_URL);
        if (fetchRes.ok) {
          const arrayBuffer = await fetchRes.arrayBuffer();
          brochureFile = Buffer.from(arrayBuffer);
        }
      } catch (fetchErr) {
        if (process.env.NODE_ENV === 'development') {
          const { log } = await import('../utils/logger.js');
          log.warn('Brochure fetch failed', { error: fetchErr?.message });
        }
        // Production: silent fail, email will include download link fallback
      }
    }

    if (!brochureFile) {
      /* Brochure PDF not found - using email link fallback */
    }

    // Send email with brochure attachment
    const COMPANY_WEBSITE = process.env.COMPANY_WEBSITE || 'https://scanbit.in';
    const brochureBlock = brochureFile
      ? `<p style="margin: 0 0 24px 0; color: #4b5563; font-size: 16px; line-height: 1.6;">
           Thank you for your interest. The ScanBit brochure is attached to this email as a PDF. Please open the attachment for full details.
         </p>`
      : `<p style="margin: 0 0 16px 0; color: #4b5563; font-size: 16px; line-height: 1.6;">
           Thank you for your interest. Download our brochure using the link below (no button):
         </p>
         <p style="margin: 0 0 24px 0;">
           <a href="${BROCHURE_PUBLIC_URL}" target="_blank" rel="noopener noreferrer"
              style="color:#ea580c; text-decoration:none;">
             Download brochure (PDF)
           </a>
         </p>
         <p style="margin: 0 0 24px 0; color: #6b7280; font-size: 13px; line-height: 1.6;">
           If the link doesn’t open, reply to this email and we’ll send it to you manually.
         </p>`;

    const mailOptions = {
      from: `"ScanBit Support" <support@scanbit.in>`,
      replyTo: 'support@scanbit.in',
      to: email,
      subject: 'ScanBit Brochure - Your Digital Business Solution',
      html: `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>ScanBit Brochure</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f9fafb;">
  <table role="presentation" style="width: 100%; border-collapse: collapse; background-color: #f9fafb;">
    <tr>
      <td style="padding: 40px 20px;">
        <table role="presentation" style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 16px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1); overflow: hidden;">
          <!-- Header (text only so logo always displays in email clients) -->
          <tr>
            <td style="background: linear-gradient(135deg, #f97316 0%, #ea580c 100%); padding: 32px 30px; text-align: center;">
              <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 700;">ScanBit</h1>
              <p style="margin: 8px 0 0 0; color: rgba(255, 255, 255, 0.95); font-size: 15px;">One QR. One Digital Look.</p>
            </td>
          </tr>
          
          <!-- Content -->
          <tr>
            <td style="padding: 40px 30px;">
              <h2 style="margin: 0 0 16px 0; color: #1f2937; font-size: 24px; font-weight: 700; line-height: 1.3;">
                Thank you for your interest in ScanBit!
              </h2>
              <p style="margin: 0 0 16px 0; color: #4b5563; font-size: 16px; line-height: 1.6;">
                Dear ${name},
              </p>
              ${brochureBlock}
              <p style="margin: 0 0 24px 0; color: #4b5563; font-size: 16px; line-height: 1.6;">
                If you have any questions or would like to learn more, please don't hesitate to contact us at:
              </p>
              <ul style="margin: 0 0 24px 0; padding-left: 20px; color: #4b5563; font-size: 16px; line-height: 1.8;">
                <li>Email: <a href="mailto:support@scanbit.in" style="color: #f97316; text-decoration: none;">support@scanbit.in</a></li>
                <li>Phone: <a href="tel:+916390420225" style="color: #f97316; text-decoration: none;">+91 6390420225</a></li>
              </ul>
              <p style="margin: 24px 0 0 0; color: #4b5563; font-size: 16px; line-height: 1.6;">
                Best regards,<br><strong>The ScanBit Team</strong>
              </p>
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="background-color: #f9fafb; padding: 30px; border-top: 1px solid #e5e7eb;">
              <table role="presentation" style="width: 100%; border-collapse: collapse;">
                <tr>
                  <td style="text-align: center; padding-bottom: 20px;">
                    <p style="margin: 0 0 16px 0; color: #6b7280; font-size: 14px; line-height: 1.6;">
                      Need help? Contact us at <a href="mailto:support@scanbit.in" style="color: #f97316; text-decoration: none; font-weight: 500;">support@scanbit.in</a>
                    </p>
                    <div style="margin: 20px 0;">
                      <a href="${COMPANY_WEBSITE}" style="display: inline-block; margin: 0 12px; color: #f97316; text-decoration: none; font-size: 14px; font-weight: 500;">Visit Website</a>
                      <span style="color: #d1d5db;">|</span>
                      <a href="${COMPANY_WEBSITE}/terms-of-service" style="display: inline-block; margin: 0 12px; color: #f97316; text-decoration: none; font-size: 14px; font-weight: 500;">Terms of Service</a>
                      <span style="color: #d1d5db;">|</span>
                      <a href="${COMPANY_WEBSITE}/privacy-policy" style="display: inline-block; margin: 0 12px; color: #f97316; text-decoration: none; font-size: 14px; font-weight: 500;">Privacy Policy</a>
                    </div>
                  </td>
                </tr>
                <tr>
                  <td style="text-align: center; padding-top: 20px; border-top: 1px solid #e5e7eb;">
                    <p style="margin: 0; color: #9ca3af; font-size: 12px; line-height: 1.5;">
                      © ${new Date().getFullYear()} ScanBit. All rights reserved.<br>
                      This email was sent to you because you requested our brochure.
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
      `,
      attachments: brochureFile
        ? [
            {
              filename: 'ScanBit_Brochure.pdf',
              content: brochureFile,
            },
          ]
        : [],
    };

    await transporter.sendMail(mailOptions);

    res.json({
      success: true,
      message: brochureFile
        ? 'Brochure sent successfully to your email'
        : 'Brochure link sent successfully to your email',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to send brochure. Please try again later.'
    });
  }
});

export default router;
