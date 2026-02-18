import express from 'express';
import Restaurant from '../models/Restaurant.js';
import Category from '../models/Category.js';
import MenuItem from '../models/MenuItem.js';
import User from '../models/User.js';
import { protect, authorize, checkRestaurantAccess } from '../middleware/auth.js';
import { getOnboardingSuccessEmailTemplate } from '../utils/emailTemplates.js';
import { sendEmail, sendQRCodeReadyEmail } from '../utils/emailService.js';
import getPublicWebsiteUrl from '../utils/publicUrl.js';

const router = express.Router();

// @route   GET /api/restaurants
// @desc    Get all restaurants (admin only) with optional filters
// @access  Private/Admin
router.get('/', protect, authorize('admin', 'masteradmin'), async (req, res) => {
  try {
    const {
      page,
      limit,
      search,
      businessCategory,
      businessType,
      verificationStatus,
      isArchived,
      subscriptionStatus,
      sortBy,
      sortOrder,
    } = req.query;

    const query = {};

    if (businessCategory) {
      query.businessCategory = businessCategory;
    }

    if (businessType) {
      query.businessType = businessType;
    }

    // Verification filter – treat missing field on old docs as "pending"
    if (verificationStatus) {
      if (verificationStatus === 'pending') {
        // Pending = explicitly pending OR not verified and field missing
        query.$and = [
          {
            $or: [
              { verificationStatus: 'pending' },
              {
                verificationStatus: { $exists: false },
                isVerified: { $ne: true }
              }
            ]
          }
        ];
      } else {
        query.verificationStatus = verificationStatus;
      }
    }

    // Archived filter – support old documents where isArchived may not exist
    if (typeof isArchived !== 'undefined') {
      if (isArchived === 'true') {
        // Only archived
        query.isArchived = true;
      } else if (isArchived === 'false') {
        // Treat "active" as not archived OR field missing
        const notArchivedCondition = {
          $or: [
            { isArchived: false },
            { isArchived: { $exists: false } },
          ]
        };

        if (query.$and) {
          query.$and.push(notArchivedCondition);
        } else {
          query.$and = [notArchivedCondition];
        }
      }
    }

    if (subscriptionStatus) {
      query['subscription.status'] = subscriptionStatus;
    }

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
      ];
    }

    const pageNum = parseInt(page, 10) || 1;
    const limitNum = parseInt(limit, 10) || 0; // 0 = no limit
    const skip = limitNum > 0 ? (pageNum - 1) * limitNum : 0;

    const sortField = typeof sortBy === 'string' && sortBy.trim() !== '' ? sortBy : 'createdAt';
    const sortDirection = sortOrder === 'asc' ? 1 : -1;

    const [restaurants, total] = await Promise.all([
      Restaurant.find(query)
        .populate('owner', 'name email')
        .sort({ [sortField]: sortDirection })
        .skip(skip)
        .limit(limitNum || 0),
      Restaurant.countDocuments(query),
    ]);

    res.json({
      success: true,
      count: restaurants.length,
      data: restaurants,
      pagination: {
        page: pageNum,
        limit: limitNum || restaurants.length,
        total,
        pages: limitNum ? Math.ceil(total / limitNum) : 1,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
    });
  }
});

// @route   GET /api/restaurants/my-restaurant
// @desc    Get current user's restaurant
// @access  Private
router.get('/my-restaurant', protect, async (req, res) => {
  try {
    const restaurant = await Restaurant.findOne({ owner: req.user.id })
      .populate('owner', 'name email');

    if (!restaurant) {
      return res.status(404).json({
        success: false,
        message: 'Restaurant not found'
      });
    }

    const plainData = restaurant && typeof restaurant.toObject === 'function'
      ? restaurant.toObject()
      : restaurant;

    // Ensure subscription expiry is up-to-date for dashboard (e.g. block after free trial)
    if (plainData.subscription && plainData.subscription.endDate) {
      const endDate = new Date(plainData.subscription.endDate);
      const now = new Date();
      const diffDays = Math.ceil((endDate - now) / (1000 * 60 * 60 * 24));
      plainData.subscription.daysRemaining = diffDays > 0 ? diffDays : 0;
      if (diffDays <= 0 && plainData.subscription.status === 'active') {
        plainData.subscription.status = 'expired';
        await Restaurant.updateOne(
          { _id: restaurant._id },
          { $set: { 'subscription.status': 'expired', 'subscription.daysRemaining': 0 } }
        );
      }
    }

    res.json({
      success: true,
      data: plainData
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// Slug validation: 3-50 chars, lowercase, alphanumeric + hyphen
const SLUG_REGEX = /^[a-z0-9][a-z0-9-]{2,49}$/;
const RESERVED_SLUGS = new Set(['admin', 'api', 'menu', 'dashboard', 'login', 'register', 'pricing', 'support', 'blog', 'blogs', 'portfolio', 'catalogue', 'demo', 'demo-menu', 'demo-catalog', 'demo-products', 'features', 'about-us', 'how-it-works', 'our-services', 'help', 'terms', 'privacy', 'checkout', 'status']);

// @route   GET /api/restaurants/check-slug/:slug
// @desc    Check if custom slug is available
// @access  Private
router.get('/check-slug/:slug', protect, async (req, res) => {
  try {
    const slug = (req.params.slug || '').trim().toLowerCase();
    const excludeId = req.query.excludeRestaurantId || req.query.excludeId;

    if (!slug) {
      return res.json({ success: true, available: false, message: 'Slug is required' });
    }

    if (slug.length < 3 || slug.length > 50) {
      return res.json({ success: true, available: false, message: 'Slug must be 3–50 characters' });
    }

    if (!SLUG_REGEX.test(slug)) {
      return res.json({ success: true, available: false, message: 'Use only letters, numbers, and hyphens' });
    }

    if (RESERVED_SLUGS.has(slug)) {
      return res.json({ success: true, available: false, message: 'This link is reserved' });
    }

    const query = { customSlug: slug };
    if (excludeId) query._id = { $ne: excludeId };

    const existing = await Restaurant.findOne(query).select('_id').lean();
    return res.json({
      success: true,
      available: !existing,
      message: existing ? 'This link is already taken' : 'Available'
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message || 'Server error' });
  }
});

// @route   PUT /api/restaurants/:id/custom-slug
// @desc    Update custom slug for restaurant
// @access  Private
router.put('/:id/custom-slug', protect, checkRestaurantAccess, async (req, res) => {
  try {
    const restaurant = await Restaurant.findById(req.params.id);
    if (!restaurant) {
      return res.status(404).json({ success: false, message: 'Restaurant not found' });
    }

    let customSlug = req.body.customSlug;
    if (customSlug !== null && customSlug !== undefined) {
      customSlug = String(customSlug).trim().toLowerCase();
      if (customSlug === '') customSlug = null;
    }

    if (customSlug === null) {
      restaurant.customSlug = null;
      await restaurant.save();
      return res.json({
        success: true,
        data: { customSlug: null },
        message: 'Custom link removed'
      });
    }

    if (customSlug.length < 3 || customSlug.length > 50) {
      return res.status(400).json({ success: false, message: 'Slug must be 3–50 characters' });
    }
    if (!SLUG_REGEX.test(customSlug)) {
      return res.status(400).json({ success: false, message: 'Use only letters, numbers, and hyphens' });
    }
    if (RESERVED_SLUGS.has(customSlug)) {
      return res.status(400).json({ success: false, message: 'This link is reserved' });
    }

    const taken = await Restaurant.findOne({ customSlug, _id: { $ne: restaurant._id } }).select('_id').lean();
    if (taken) {
      return res.status(400).json({ success: false, message: 'This link is already taken' });
    }

    restaurant.customSlug = customSlug;
    await restaurant.save();

    res.json({
      success: true,
      data: { customSlug: restaurant.customSlug },
      message: 'Custom link updated'
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message || 'Server error' });
  }
});

// @route   GET /api/restaurants/:id
// @desc    Get single restaurant
// @access  Private
router.get('/:id', protect, checkRestaurantAccess, async (req, res) => {
  try {
    const restaurant = await Restaurant.findById(req.params.id)
      .populate('owner', 'name email');

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

// @route   PUT /api/restaurants/:id
// @desc    Update restaurant (owners can update their own, admins can update any)
// @access  Private
router.put('/:id', protect, checkRestaurantAccess, async (req, res) => {
  try {
    const existingRestaurant = await Restaurant.findById(req.params.id);

    if (!existingRestaurant) {
      return res.status(404).json({
        success: false,
        message: 'Restaurant not found'
      });
    }

    // Use $set with dot notation for reliable nested field persistence
    const setOp = {};

    const topLevelFields = [
      'name', 'tagline', 'profile', 'email', 'phone', 'whatsapp',
      'openingHours', 'openingHoursSchedule', 'logo', 'businessCardFront', 'businessCardBack',
      'address', 'verificationStatus', 'isVerified', 'isArchived', 'isActive',
      'showQuickActions', 'showSocialLinks', 'showWhatsAppButton',
      'onboardingCompleted'
    ];
    topLevelFields.forEach((key) => {
      if (req.body[key] !== undefined) setOp[key] = req.body[key];
    });

    if (req.body.foodImages !== undefined) {
      setOp.foodImages = Array.isArray(req.body.foodImages)
        ? [...new Set(req.body.foodImages)]
        : [];
    }

    // Portfolio-specific fields
    if (req.body.portfolioGallery !== undefined) {
      setOp.portfolioGallery = Array.isArray(req.body.portfolioGallery)
        ? [...new Set(req.body.portfolioGallery)]
        : [];
    }
    if (req.body.portfolioResumeUrl !== undefined) {
      setOp.portfolioResumeUrl = req.body.portfolioResumeUrl || null;
    }
    if (req.body.portfolioTitle !== undefined) {
      setOp.portfolioTitle = req.body.portfolioTitle || null;
    }
    if (req.body.portfolioMapEmbedUrl !== undefined) {
      setOp.portfolioMapEmbedUrl = req.body.portfolioMapEmbedUrl || null;
    }
    if (req.body.portfolioTheme !== undefined) {
      setOp.portfolioTheme = req.body.portfolioTheme || 'orange';
    }
    if (req.body.portfolioPracticeAreas !== undefined) {
      setOp.portfolioPracticeAreas = Array.isArray(req.body.portfolioPracticeAreas)
        ? req.body.portfolioPracticeAreas
        : [];
    }
    if (req.body.portfolioExperience !== undefined) {
      setOp.portfolioExperience = Array.isArray(req.body.portfolioExperience)
        ? req.body.portfolioExperience
        : [];
    }
    if (req.body.portfolioProjects !== undefined) {
      setOp.portfolioProjects = Array.isArray(req.body.portfolioProjects)
        ? req.body.portfolioProjects
        : [];
    }
    if (req.body.portfolioTestimonials !== undefined) {
      setOp.portfolioTestimonials = Array.isArray(req.body.portfolioTestimonials)
        ? req.body.portfolioTestimonials
        : [];
    }
    if (req.body.agencyHeroImageUrl !== undefined) {
      setOp.agencyHeroImageUrl = req.body.agencyHeroImageUrl && String(req.body.agencyHeroImageUrl).trim() ? String(req.body.agencyHeroImageUrl).trim() : null;
    }
    if (req.body.agencyHeroBackgroundUrl !== undefined) {
      setOp.agencyHeroBackgroundUrl = req.body.agencyHeroBackgroundUrl && String(req.body.agencyHeroBackgroundUrl).trim() ? String(req.body.agencyHeroBackgroundUrl).trim() : null;
    }
    if (req.body.agencyGallery !== undefined) {
      setOp.agencyGallery = Array.isArray(req.body.agencyGallery) ? req.body.agencyGallery : [];
    }
    if (req.body.agencyServices !== undefined) {
      setOp.agencyServices = Array.isArray(req.body.agencyServices) ? req.body.agencyServices.filter(Boolean).map(s => String(s).trim()) : [];
    }

    // socialMedia: merge incoming with existing, then set whole object
    const prevSocial = existingRestaurant.socialMedia;
    const prevSocialObj = (prevSocial && typeof prevSocial.toObject === 'function' ? prevSocial.toObject() : prevSocial) || {};
    const incomingSocial = req.body.socialMedia && typeof req.body.socialMedia === 'object' ? req.body.socialMedia : {};
    const socialMedia = { ...prevSocialObj, ...incomingSocial };
    setOp.socialMedia = socialMedia;

    // location: merge incoming with existing, only keep lat/lng/address
    const prevLoc = existingRestaurant.location;
    const prevLocObj = (prevLoc && typeof prevLoc.toObject === 'function' ? prevLoc.toObject() : prevLoc) || {};
    const incomingLoc = req.body.location && typeof req.body.location === 'object' ? req.body.location : {};
    const mergedLoc = { ...prevLocObj, ...incomingLoc };
    const locClean = {};
    ['lat', 'lng', 'address'].forEach((k) => {
      const v = mergedLoc[k];
      if (v !== undefined && v !== null && v !== '') locClean[k] = v;
    });
    setOp.location = locClean;

    const wasOnboardingCompleted = existingRestaurant.onboardingCompleted === true;
    const nowOnboardingCompleted = setOp.onboardingCompleted === true;

    const restaurant = await Restaurant.findByIdAndUpdate(
      req.params.id,
      { $set: setOp },
      { new: true, runValidators: true }
    );

    if (nowOnboardingCompleted && !wasOnboardingCompleted && restaurant?.owner) {
      const owner = await User.findById(restaurant.owner).select('name email').lean();
      if (owner?.email) {
        const baseUrl = getPublicWebsiteUrl();
        const dashboardUrl = `${baseUrl}/dashboard`;
        const category = (restaurant.businessCategory || restaurant.businessType || '').toLowerCase();
        const isPortfolio = /portfolio|professional|creative|design|agency|consult|legal|service/.test(category);
        const menuUrl = isPortfolio ? `${baseUrl}/portfolio/${restaurant._id}` : `${baseUrl}/menu/${restaurant._id}`;
        const onboardingHtml = getOnboardingSuccessEmailTemplate(owner.name, restaurant.name, dashboardUrl);
        sendEmail(owner.email, 'Onboarding successful — ScanBit', onboardingHtml).catch(() => {});
        sendQRCodeReadyEmail(owner.email, restaurant.name, restaurant.businessType, restaurant.businessCategory, menuUrl).catch(() => {});
      }
    }

    const plainData = restaurant && typeof restaurant.toObject === 'function'
      ? restaurant.toObject()
      : restaurant;

    res.json({
      success: true,
      data: plainData
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Server error'
    });
  }
});

// @route   DELETE /api/restaurants/:id
// @desc    Delete restaurant (admin only)
// @access  Private/Admin
router.delete('/:id', protect, authorize('admin', 'masteradmin'), async (req, res) => {
  try {
    const restaurant = await Restaurant.findByIdAndDelete(req.params.id);

    if (!restaurant) {
      return res.status(404).json({
        success: false,
        message: 'Restaurant not found',
      });
    }

    res.json({
      success: true,
      message: 'Restaurant deleted successfully',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
    });
  }
});

// @route   DELETE /api/restaurants/clear-menu-data
// @desc    Clear all categories and menu items for user's restaurant
// @access  Private
router.delete('/clear-menu-data', protect, async (req, res) => {
  try {
    const restaurantId = req.user.restaurant;
    
    if (!restaurantId) {
      return res.status(400).json({
        success: false,
        message: 'User must be associated with a restaurant'
      });
    }

    // Delete all categories for this restaurant
    const categoriesDeleted = await Category.deleteMany({ restaurant: restaurantId });
    
    // Delete all menu items for this restaurant
    const itemsDeleted = await MenuItem.deleteMany({ restaurant: restaurantId });

    res.json({
      success: true,
      message: 'All menu data cleared successfully',
      data: {
        categoriesDeleted: categoriesDeleted.deletedCount,
        itemsDeleted: itemsDeleted.deletedCount
      }
    });
  } catch (error) {

    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   GET /api/restaurants/:restaurantId/menu
// @desc    Get restaurant menu (public)
// @access  Public
router.get('/:restaurantId/menu', async (req, res) => {
  try {
    const restaurant = await Restaurant.findById(req.params.restaurantId);
    
    if (!restaurant) {
      return res.status(404).json({
        success: false,
        message: 'Restaurant not found'
      });
    }

    // This will be populated by menu routes
    res.json({
      success: true,
      restaurant: {
        id: restaurant._id,
        name: restaurant.name,
        businessType: restaurant.businessType,
        logo: restaurant.logo
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

export default router;
