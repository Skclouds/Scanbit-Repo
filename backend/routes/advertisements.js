import { body, validationResult } from 'express-validator';
import express from 'express';

import { protect, authorize } from '../middleware/auth.js';
import Advertisement from '../models/Advertisement.js';
import AdImpression from '../models/AdImpression.js';


const router = express.Router();

// ==================== PUBLIC ROUTES (No Authentication Required) ====================

// @route   GET /api/advertisements/public/active
// @desc    Get active advertisements for display (public)
// @access  Public
router.get('/public/active', async (req, res) => {
  try {
    const { page, businessCategory } = req.query;
    const now = new Date();
    const currentDay = now.getDay(); // 0 = Sunday, 6 = Saturday
    const currentDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    // Build base query for active ads
    const baseQuery = {
      status: 'active',
      startDate: { $lte: now },
      endDate: { $gte: now }
    };

    // Page targeting - pageTargeting is an array, check if page is in the array
    if (page) {
      baseQuery.pageTargeting = { $in: [page, 'custom', 'all'] };
    } else {
      baseQuery.pageTargeting = { $in: ['all', 'custom'] };
    }

    // Business category targeting - businessCategoryTargeting is also an array
    if (businessCategory) {
      baseQuery.businessCategoryTargeting = { $in: [businessCategory, 'all'] };
    } else {
      // If no category specified, include ads targeting 'all'
      baseQuery.businessCategoryTargeting = { $in: ['all'] };
    }

    // Find all ads that match base criteria
    let ads = await Advertisement.find(baseQuery)
      .sort({ priority: -1, createdAt: -1 })
      .select('-createdBy -updatedBy -notes -tags -__v')
      .lean();

    // Apply additional filtering based on scheduling rules
    ads = ads.filter((ad) => {
      // Check weekend-only rule
      if (ad.schedulingRules?.showOnlyOnWeekends) {
        if (currentDay !== 0 && currentDay !== 6) {
          // Not Saturday (6) or Sunday (0)
          return false;
        }
      }

      // Check specific dates rule
      if (ad.schedulingRules?.showOnlyOnDates && ad.schedulingRules.showOnlyOnDates.length > 0) {
        const showDates = ad.schedulingRules.showOnlyOnDates.map((date) => {
          const d = new Date(date);
          return new Date(d.getFullYear(), d.getMonth(), d.getDate());
        });
        const isInShowDates = showDates.some((showDate) => 
          showDate.getTime() === currentDate.getTime()
        );
        if (!isInShowDates) {
          return false;
        }
      }

      // Check time-based rules (if implemented)
      if (ad.schedulingRules?.showOnlyAtTimes && ad.schedulingRules.showOnlyAtTimes.length > 0) {
        const currentHour = now.getHours();
        const currentMinute = now.getMinutes();
        const currentTime = currentHour * 60 + currentMinute;
        
        const isInTimeRange = ad.schedulingRules.showOnlyAtTimes.some((timeRange) => {
          const start = timeRange.start ? 
            (timeRange.start.hour * 60 + (timeRange.start.minute || 0)) : 0;
          const end = timeRange.end ? 
            (timeRange.end.hour * 60 + (timeRange.end.minute || 0)) : 1439; // 23:59
          return currentTime >= start && currentTime <= end;
        });
        
        if (!isInTimeRange) {
          return false;
        }
      }

      // Check custom URL targeting
      if (ad.pageTargeting?.includes('custom') && ad.customUrls && ad.customUrls.length > 0) {
        // This will be handled on the frontend based on the current URL
        // Backend just returns ads with custom targeting
      }

      return true;
    });

    // Convert priority to numeric for better sorting
    ads.sort((a, b) => {
      const priorityOrder = { high: 3, medium: 2, low: 1 };
      const aPriority = priorityOrder[a.priority] || 2;
      const bPriority = priorityOrder[b.priority] || 2;
      
      if (aPriority !== bPriority) {
        return bPriority - aPriority;
      }
      
      // If same priority, sort by creation date (newest first)
      return new Date(b.createdAt) - new Date(a.createdAt);
    });

    res.json({
      success: true,
      data: ads
    });
  } catch (error) {

    res.status(500).json({
      success: false,
      message: 'Failed to fetch active advertisements'
    });
  }
});

// @route   POST /api/advertisements/public/impression
// @desc    Log advertisement impression
// @access  Public
router.post('/public/impression', async (req, res) => {
  try {
    const { advertisementId, page, businessCategory, sessionId, device, ipAddress, referrer } = req.body;

    // Create impression record
    const impression = new AdImpression({
      advertisement: advertisementId,
      sessionId: sessionId || `session_${Date.now()}`,
      page: page || 'unknown',
      businessCategory: businessCategory || null,
      device: device || { type: 'desktop', userAgent: req.headers['user-agent'] || '' },
      ipAddress: ipAddress || req.ip,
      referrer: referrer || req.headers.referer || null
    });

    await impression.save();

    // Update advertisement analytics
    await Advertisement.findByIdAndUpdate(advertisementId, {
      $inc: { 'analytics.impressions': 1 },
      'analytics.lastViewed': new Date()
    });

    res.json({
      success: true,
      message: 'Impression logged'
    });
  } catch (error) {

    res.status(500).json({
      success: false,
      message: 'Failed to log impression'
    });
  }
});

// @route   POST /api/advertisements/public/click
// @desc    Log advertisement click
// @access  Public
router.post('/public/click', async (req, res) => {
  try {
    const { advertisementId, impressionId, sessionId } = req.body;

    // Update impression
    if (impressionId) {
      await AdImpression.findByIdAndUpdate(impressionId, {
        clicked: true,
        clickedAt: new Date()
      });
    } else if (sessionId) {
      // Find latest impression for this session
      const impression = await AdImpression.findOne({
        advertisement: advertisementId,
        sessionId,
        clicked: false
      }).sort({ timestamp: -1 });

      if (impression) {
        impression.clicked = true;
        impression.clickedAt = new Date();
        await impression.save();
      }
    }

    // Update advertisement analytics
    await Advertisement.findByIdAndUpdate(advertisementId, {
      $inc: { 'analytics.clicks': 1 },
      'analytics.lastClicked': new Date()
    });

    res.json({
      success: true,
      message: 'Click logged'
    });
  } catch (error) {

    res.status(500).json({
      success: false,
      message: 'Failed to log click'
    });
  }
});

// ==================== PROTECTED ROUTES (Authentication Required) ====================

// All routes below require authentication
router.use(protect);

// ==================== ADMIN ROUTES ====================

// @route   GET /api/advertisements
// @desc    Get all advertisements (admin)
// @access  Private/Admin
router.get('/', authorize('admin'), async (req, res) => {
  try {
    const { 
      status, 
      adType, 
      businessCategory, 
      page, 
      limit = 20,
      search 
    } = req.query;

    const query = {};
    
    if (status) {
      query.status = status;
    }
    if (adType) {
      query.adType = adType;
    }
    if (businessCategory && businessCategory !== 'all') {
      query.businessCategoryTargeting = { $in: [businessCategory, 'all'] };
    }
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { campaignName: { $regex: search, $options: 'i' } },
        { headline: { $regex: search, $options: 'i' } }
      ];
    }

    const advertisements = await Advertisement.find(query)
      .populate('createdBy', 'name email')
      .populate('updatedBy', 'name email')
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit));

    const total = await Advertisement.countDocuments(query);

    res.json({
      success: true,
      data: advertisements,
      pagination: {
        page: parseInt(page) || 1,
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {

    res.status(500).json({
      success: false,
      message: 'Failed to fetch advertisements'
    });
  }
});

// @route   GET /api/advertisements/dashboard
// @desc    Get advertisement dashboard stats
// @access  Private/Admin
router.get('/dashboard', authorize('admin'), async (req, res) => {
  try {
    const { businessCategory, dateRange = '30' } = req.query;
    const days = parseInt(dateRange);
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const query = businessCategory && businessCategory !== 'all' 
      ? { businessCategoryTargeting: { $in: [businessCategory, 'all'] } }
      : {};

    const [
      totalAds,
      activeAds,
      scheduledAds,
      expiredAds,
      draftAds,
      pausedAds,
      impressions,
      clicks,
      conversions
    ] = await Promise.all([
      Advertisement.countDocuments(query),
      Advertisement.countDocuments({ ...query, status: 'active' }),
      Advertisement.countDocuments({ ...query, status: 'scheduled' }),
      Advertisement.countDocuments({ ...query, status: 'expired' }),
      Advertisement.countDocuments({ ...query, status: 'draft' }),
      Advertisement.countDocuments({ ...query, status: 'paused' }),
      AdImpression.countDocuments({ 
        timestamp: { $gte: startDate },
        ...(businessCategory && businessCategory !== 'all' ? { businessCategory } : {})
      }),
      AdImpression.countDocuments({ 
        clicked: true,
        timestamp: { $gte: startDate },
        ...(businessCategory && businessCategory !== 'all' ? { businessCategory } : {})
      }),
      AdImpression.countDocuments({ 
        converted: true,
        timestamp: { $gte: startDate },
        ...(businessCategory && businessCategory !== 'all' ? { businessCategory } : {})
      })
    ]);

    // Get top performing ads
    const topAds = await Advertisement.find(query)
      .sort({ 'analytics.clicks': -1 })
      .limit(5)
      .select('title campaignName adType status analytics');

    // Get ads by type
    const adsByType = await Advertisement.aggregate([
      { $match: query },
      { $group: { _id: '$adType', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);

    const typeBreakdown = {};
    adsByType.forEach(item => {
      typeBreakdown[item._id] = item.count;
    });

    // Get time-series data for charts
    const timeSeriesQuery = {
      timestamp: { $gte: startDate },
      ...(businessCategory && businessCategory !== 'all' ? { businessCategory } : {})
    };

    const impressionsData = await AdImpression.aggregate([
      { $match: timeSeriesQuery },
      {
        $group: {
          _id: {
            $dateToString: { format: '%Y-%m-%d', date: '$timestamp' }
          },
          impressions: { $sum: 1 },
          clicks: { $sum: { $cond: ['$clicked', 1, 0] } },
          conversions: { $sum: { $cond: ['$converted', 1, 0] } }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    // Format time-series data
    const timeSeries = impressionsData.map(item => ({
      date: item._id,
      impressions: item.impressions,
      clicks: item.clicks,
      conversions: item.conversions,
      ctr: item.impressions > 0 ? ((item.clicks / item.impressions) * 100).toFixed(2) : 0
    }));

    // Get device-wise performance
    const deviceStats = await AdImpression.aggregate([
      { $match: timeSeriesQuery },
      {
        $group: {
          _id: '$device.type',
          impressions: { $sum: 1 },
          clicks: { $sum: { $cond: ['$clicked', 1, 0] } }
        }
      }
    ]);

    const deviceBreakdown = {};
    deviceStats.forEach(item => {
      const device = item._id || 'unknown';
      deviceBreakdown[device] = {
        impressions: item.impressions,
        clicks: item.clicks,
        ctr: item.impressions > 0 ? ((item.clicks / item.impressions) * 100).toFixed(2) : 0
      };
    });

    // Get page-wise performance
    const pageStats = await AdImpression.aggregate([
      { $match: timeSeriesQuery },
      {
        $group: {
          _id: '$page',
          impressions: { $sum: 1 },
          clicks: { $sum: { $cond: ['$clicked', 1, 0] } }
        }
      },
      { $sort: { impressions: -1 } },
      { $limit: 10 }
    ]);

    const pageBreakdown = pageStats.map(item => ({
      page: item._id || 'unknown',
      impressions: item.impressions,
      clicks: item.clicks,
      ctr: item.impressions > 0 ? ((item.clicks / item.impressions) * 100).toFixed(2) : 0
    }));

    // Calculate averages
    const totalImpressions = impressions;
    const totalClicks = clicks;
    const ctr = impressions > 0 ? ((totalClicks / totalImpressions) * 100).toFixed(2) : 0;
    const averageImpressions = totalAds > 0 ? (totalImpressions / totalAds).toFixed(2) : 0;
    const averageClicks = totalAds > 0 ? (totalClicks / totalAds).toFixed(2) : 0;

    res.json({
      success: true,
      data: {
        // Stats object (for dashboard cards)
        stats: {
          totalAds,
          totalImpressions,
          totalClicks,
          totalConversions: conversions,
          averageCTR: parseFloat(ctr),
          averageImpressions: parseFloat(averageImpressions),
          averageClicks: parseFloat(averageClicks)
        },
        
        // Status breakdown object (for status cards)
        statusBreakdown: {
          active: activeAds,
          scheduled: scheduledAds,
          paused: pausedAds,
          draft: draftAds,
          expired: expiredAds
        },
        
        // Type breakdown
        typeBreakdown,
        
        // Top performing ads
        topAds: topAds.map(ad => ({
          _id: ad._id,
          title: ad.title,
          campaignName: ad.campaignName,
          adType: ad.adType,
          status: ad.status,
          impressions: ad.analytics?.impressions || 0,
          clicks: ad.analytics?.clicks || 0,
          ctr: ad.analytics?.impressions > 0 
            ? ((ad.analytics.clicks / ad.analytics.impressions) * 100).toFixed(2) 
            : 0
        })),
        
        // Time-series data for charts
        timeSeries,
        
        // Device breakdown
        deviceBreakdown,
        
        // Page breakdown
        pageBreakdown,
        
        // Overall metrics (for backward compatibility)
        totalAds,
        activeAds,
        scheduledAds,
        expiredAds,
        draftAds,
        pausedAds,
        impressions,
        clicks,
        conversions,
        ctr: parseFloat(ctr)
      }
    });
  } catch (error) {

    res.status(500).json({
      success: false,
      message: 'Failed to fetch dashboard stats'
    });
  }
});

// @route   GET /api/advertisements/:id
// @desc    Get advertisement by ID
// @access  Private/Admin
router.get('/:id', authorize('admin'), async (req, res) => {
  try {
    const advertisement = await Advertisement.findById(req.params.id)
      .populate('createdBy', 'name email')
      .populate('updatedBy', 'name email');

    if (!advertisement) {
      return res.status(404).json({
        success: false,
        message: 'Advertisement not found'
      });
    }

    res.json({
      success: true,
      data: advertisement
    });
  } catch (error) {

    res.status(500).json({
      success: false,
      message: 'Failed to fetch advertisement'
    });
  }
});

// @route   POST /api/advertisements
// @desc    Create new advertisement
// @access  Private/Admin
router.post('/', authorize('admin'), [
  body('title').notEmpty().trim().withMessage('Title is required'),
  body('campaignName').notEmpty().trim().withMessage('Campaign name is required'),
  body('adType').isIn([
    'header-banner',
    'sticky-top-bar',
    'popup-modal',
    'slide-in-popup',
    'announcement-bar',
    'full-width-banner',
    'cta-floating-button',
    'exit-intent-popup'
  ]).withMessage('Invalid ad type'),
  body('headline').notEmpty().trim().withMessage('Headline is required'),
  body('ctaButtonLink').notEmpty().trim().withMessage('CTA link is required'),
  body('pageTargeting').isArray({ min: 1 }).withMessage('At least one page must be selected'),
  body('startDate').isISO8601().withMessage('Valid start date is required'),
  body('endDate').isISO8601().withMessage('Valid end date is required'),
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }

    // Validate end date is after start date
    if (new Date(req.body.endDate) <= new Date(req.body.startDate)) {
      return res.status(400).json({
        success: false,
        message: 'End date must be after start date'
      });
    }

    const advertisementData = {
      ...req.body,
      createdBy: req.user.id,
      updatedBy: req.user.id
    };

    const advertisement = new Advertisement(advertisementData);
    await advertisement.save();

    res.status(201).json({
      success: true,
      message: 'Advertisement created successfully',
      data: advertisement
    });
  } catch (error) {

    res.status(500).json({
      success: false,
      message: 'Failed to create advertisement'
    });
  }
});

// @route   PUT /api/advertisements/:id
// @desc    Update advertisement
// @access  Private/Admin
router.put('/:id', authorize('admin'), [
  body('endDate').optional().isISO8601().withMessage('Valid end date is required'),
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }

    const advertisement = await Advertisement.findById(req.params.id);
    if (!advertisement) {
      return res.status(404).json({
        success: false,
        message: 'Advertisement not found'
      });
    }

    // Validate end date if provided
    if (req.body.endDate && req.body.startDate) {
      if (new Date(req.body.endDate) <= new Date(req.body.startDate)) {
        return res.status(400).json({
          success: false,
          message: 'End date must be after start date'
        });
      }
    }

    Object.assign(advertisement, req.body);
    advertisement.updatedBy = req.user.id;
    await advertisement.save();

    res.json({
      success: true,
      message: 'Advertisement updated successfully',
      data: advertisement
    });
  } catch (error) {

    res.status(500).json({
      success: false,
      message: 'Failed to update advertisement'
    });
  }
});

// @route   DELETE /api/advertisements/:id
// @desc    Delete advertisement
// @access  Private/Admin
router.delete('/:id', authorize('admin'), async (req, res) => {
  try {
    const advertisement = await Advertisement.findById(req.params.id);
    if (!advertisement) {
      return res.status(404).json({
        success: false,
        message: 'Advertisement not found'
      });
    }

    // Delete associated impressions
    await AdImpression.deleteMany({ advertisement: advertisement._id });

    await Advertisement.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: 'Advertisement deleted successfully'
    });
  } catch (error) {

    res.status(500).json({
      success: false,
      message: 'Failed to delete advertisement'
    });
  }
});

// @route   POST /api/advertisements/:id/duplicate
// @desc    Duplicate advertisement
// @access  Private/Admin
router.post('/:id/duplicate', authorize('admin'), async (req, res) => {
  try {
    const original = await Advertisement.findById(req.params.id);
    if (!original) {
      return res.status(404).json({
        success: false,
        message: 'Advertisement not found'
      });
    }

    const duplicateData = original.toObject();
    delete duplicateData._id;
    delete duplicateData.createdAt;
    delete duplicateData.updatedAt;
    duplicateData.title = `${duplicateData.title} (Copy)`;
    duplicateData.status = 'draft';
    duplicateData.analytics = {
      impressions: 0,
      clicks: 0,
      conversions: 0
    };
    duplicateData.createdBy = req.user.id;
    duplicateData.updatedBy = req.user.id;

    const duplicate = new Advertisement(duplicateData);
    await duplicate.save();

    res.json({
      success: true,
      message: 'Advertisement duplicated successfully',
      data: duplicate
    });
  } catch (error) {

    res.status(500).json({
      success: false,
      message: 'Failed to duplicate advertisement'
    });
  }
});

// @route   PUT /api/advertisements/:id/status
// @desc    Update advertisement status
// @access  Private/Admin
router.put('/:id/status', authorize('admin'), [
  body('status').isIn(['draft', 'active', 'scheduled', 'paused', 'expired', 'archived']).withMessage('Invalid status'),
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }

    const advertisement = await Advertisement.findById(req.params.id);
    if (!advertisement) {
      return res.status(404).json({
        success: false,
        message: 'Advertisement not found'
      });
    }

    advertisement.status = req.body.status;
    advertisement.updatedBy = req.user.id;
    await advertisement.save();

    res.json({
      success: true,
      message: `Advertisement ${req.body.status} successfully`,
      data: advertisement
    });
  } catch (error) {

    res.status(500).json({
      success: false,
      message: 'Failed to update status'
    });
  }
});

// @route   GET /api/advertisements/:id/analytics
// @desc    Get advertisement analytics
// @access  Private/Admin
router.get('/:id/analytics', authorize('admin'), async (req, res) => {
  try {
    const { dateRange = '30', groupBy = 'day' } = req.query;
    const days = parseInt(dateRange);
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const advertisement = await Advertisement.findById(req.params.id);
    if (!advertisement) {
      return res.status(404).json({
        success: false,
        message: 'Advertisement not found'
      });
    }

    // Get impressions and clicks
    const impressions = await AdImpression.find({
      advertisement: req.params.id,
      timestamp: { $gte: startDate }
    }).sort({ timestamp: 1 });

    const clicks = impressions.filter(imp => imp.clicked);

    // Group by date
    const groupedData = {};
    impressions.forEach(imp => {
      const dateKey = imp.timestamp.toISOString().split('T')[0];
      if (!groupedData[dateKey]) {
        groupedData[dateKey] = { impressions: 0, clicks: 0 };
      }
      groupedData[dateKey].impressions += 1;
      if (imp.clicked) {
        groupedData[dateKey].clicks += 1;
      }
    });

    // Page-wise performance
    const pageStats = {};
    impressions.forEach(imp => {
      if (!pageStats[imp.page]) {
        pageStats[imp.page] = { impressions: 0, clicks: 0 };
      }
      pageStats[imp.page].impressions += 1;
      if (imp.clicked) {
        pageStats[imp.page].clicks += 1;
      }
    });

    // Device-wise performance
    const deviceStats = {};
    impressions.forEach(imp => {
      const device = imp.device?.type || 'unknown';
      if (!deviceStats[device]) {
        deviceStats[device] = { impressions: 0, clicks: 0 };
      }
      deviceStats[device].impressions += 1;
      if (imp.clicked) {
        deviceStats[device].clicks += 1;
      }
    });

    res.json({
      success: true,
      data: {
        totalImpressions: impressions.length,
        totalClicks: clicks.length,
        ctr: impressions.length > 0 ? ((clicks.length / impressions.length) * 100).toFixed(2) : 0,
        timeSeries: Object.entries(groupedData).map(([date, stats]) => ({
          date,
          impressions: stats.impressions,
          clicks: stats.clicks,
          ctr: stats.impressions > 0 ? ((stats.clicks / stats.impressions) * 100).toFixed(2) : 0
        })),
        pageStats: Object.entries(pageStats).map(([page, stats]) => ({
          page,
          impressions: stats.impressions,
          clicks: stats.clicks,
          ctr: stats.impressions > 0 ? ((stats.clicks / stats.impressions) * 100).toFixed(2) : 0
        })),
        deviceStats: Object.entries(deviceStats).map(([device, stats]) => ({
          device,
          impressions: stats.impressions,
          clicks: stats.clicks,
          ctr: stats.impressions > 0 ? ((stats.clicks / stats.impressions) * 100).toFixed(2) : 0
        }))
      }
    });
  } catch (error) {

    res.status(500).json({
      success: false,
      message: 'Failed to fetch analytics'
    });
  }
});

// @route   POST /api/advertisements/seed
// @desc    Seed demo advertisements (all types)
// @access  Private/Admin
router.post('/seed', authorize('admin'), async (req, res) => {
  try {
    const now = new Date();
    const startDate = new Date(now);
    startDate.setHours(0, 0, 0, 0);
    
    const endDate = new Date(now);
    endDate.setMonth(endDate.getMonth() + 3); // 3 months from now
    
    const demoAds = [
      // 1. Header Banner
      {
        title: 'New Year Special Offer',
        campaignName: 'New Year 2026 Campaign',
        adType: 'header-banner',
        status: 'active',
        priority: 'high',
        headline: '🎉 New Year Special: Get 50% Off on All Plans!',
        subHeadline: 'Limited Time Offer',
        description: 'Start the new year with amazing savings. Upgrade your plan today!',
        ctaButtonText: 'Claim Offer',
        ctaButtonLink: '/pricing',
        ctaType: 'internal',
        backgroundColor: '#1e40af',
        textColor: '#ffffff',
        gradient: {
          enabled: true,
          colors: ['#1e40af', '#3b82f6'],
          direction: 'to-right'
        },
        pageTargeting: ['home', 'menu'],
        businessCategoryTargeting: ['all'],
        startDate: startDate,
        endDate: endDate,
        timezone: 'Asia/Kolkata',
        schedulingRules: {
          showOnlyOnWeekends: false,
          showXTimesPerUser: null,
          showOncePerSession: false,
          delaySeconds: 0,
          scrollTriggerPercent: null
        },
        displaySettings: {
          position: 'top',
          width: '100%',
          height: '60px',
          zIndex: 1000,
          closeable: true,
          dismissible: true,
          showOnMobile: true,
          showOnDesktop: true
        },
        notes: 'Demo header banner for New Year promotion',
        tags: ['promotion', 'new-year', 'header']
      },
      
      // 2. Sticky Top Bar
      {
        title: 'Weekend Sale Announcement',
        campaignName: 'Weekend Sale 2026',
        adType: 'sticky-top-bar',
        status: 'active',
        priority: 'medium',
        headline: '🔥 Weekend Sale: Save up to 40% on Premium Plans',
        subHeadline: 'Valid this weekend only',
        description: 'Don\'t miss out on our weekend special offers!',
        ctaButtonText: 'Shop Now',
        ctaButtonLink: '/pricing',
        ctaType: 'internal',
        backgroundColor: '#dc2626',
        textColor: '#ffffff',
        pageTargeting: ['home', 'menu', 'product-listing'],
        businessCategoryTargeting: ['all'],
        startDate: startDate,
        endDate: endDate,
        schedulingRules: {
          showOnlyOnWeekends: true,
          showXTimesPerUser: 3,
          showOncePerSession: false,
          delaySeconds: 2,
          scrollTriggerPercent: null
        },
        displaySettings: {
          position: 'top',
          width: '100%',
          height: '50px',
          zIndex: 999,
          closeable: true,
          dismissible: true,
          showOnMobile: true,
          showOnDesktop: true
        },
        notes: 'Demo sticky top bar for weekend sales',
        tags: ['sale', 'weekend', 'sticky']
      },
      
      // 3. Popup Modal
      {
        title: 'Feature Launch Announcement',
        campaignName: 'New Feature Launch',
        adType: 'popup-modal',
        status: 'active',
        priority: 'high',
        headline: '🚀 Exciting New Features Available!',
        subHeadline: 'Enhanced Analytics & Reporting',
        description: 'We\'ve added powerful new analytics tools to help you grow your business. Check them out now!',
        ctaButtonText: 'Explore Features',
        ctaButtonLink: '/features',
        ctaType: 'internal',
        backgroundColor: '#7c3aed',
        textColor: '#ffffff',
        gradient: {
          enabled: true,
          colors: ['#7c3aed', '#a855f7'],
          direction: 'diagonal'
        },
        pageTargeting: ['home'],
        businessCategoryTargeting: ['all'],
        startDate: startDate,
        endDate: endDate,
        schedulingRules: {
          showOnlyOnWeekends: false,
          showXTimesPerUser: 1,
          showOncePerSession: true,
          delaySeconds: 3,
          scrollTriggerPercent: null
        },
        displaySettings: {
          position: 'center',
          width: '500px',
          height: 'auto',
          zIndex: 10000,
          closeable: true,
          dismissible: true,
          showOnMobile: true,
          showOnDesktop: true
        },
        notes: 'Demo popup modal for feature announcements',
        tags: ['feature', 'announcement', 'modal']
      },
      
      // 4. Slide-In Popup
      {
        title: 'Special Discount Offer',
        campaignName: 'Flash Sale Campaign',
        adType: 'slide-in-popup',
        status: 'active',
        priority: 'medium',
        headline: '⚡ Flash Sale: 30% Off Today Only!',
        subHeadline: 'Limited Time Offer',
        description: 'Get instant access to premium features at a discounted price.',
        ctaButtonText: 'Get Discount',
        ctaButtonLink: '/register',
        ctaType: 'internal',
        backgroundColor: '#f59e0b',
        textColor: '#ffffff',
        pageTargeting: ['home', 'menu'],
        businessCategoryTargeting: ['all'],
        startDate: startDate,
        endDate: endDate,
        schedulingRules: {
          showOnlyOnWeekends: false,
          showXTimesPerUser: 2,
          showOncePerSession: false,
          delaySeconds: 5,
          scrollTriggerPercent: 30
        },
        displaySettings: {
          position: 'right',
          width: '350px',
          height: 'auto',
          zIndex: 5000,
          closeable: true,
          dismissible: true,
          showOnMobile: false,
          showOnDesktop: true
        },
        notes: 'Demo slide-in popup for flash sales',
        tags: ['flash-sale', 'discount', 'slide-in']
      },
      
      // 5. Announcement Bar
      {
        title: 'System Maintenance Notice',
        campaignName: 'Maintenance Announcement',
        adType: 'announcement-bar',
        status: 'active',
        priority: 'low',
        headline: '⚠️ Scheduled Maintenance: Jan 25, 2:00 AM - 4:00 AM IST',
        subHeadline: 'System will be temporarily unavailable',
        description: 'We\'re performing scheduled maintenance to improve performance. Services will resume shortly.',
        ctaButtonText: 'Learn More',
        ctaButtonLink: '/support',
        ctaType: 'internal',
        backgroundColor: '#f97316',
        textColor: '#ffffff',
        pageTargeting: ['home', 'menu', 'product-listing', 'product-detail'],
        businessCategoryTargeting: ['all'],
        startDate: startDate,
        endDate: endDate,
        schedulingRules: {
          showOnlyOnWeekends: false,
          showXTimesPerUser: null,
          showOncePerSession: false,
          delaySeconds: 0,
          scrollTriggerPercent: null
        },
        displaySettings: {
          position: 'top',
          width: '100%',
          height: 'auto',
          zIndex: 1001,
          closeable: true,
          dismissible: true,
          showOnMobile: true,
          showOnDesktop: true
        },
        notes: 'Demo announcement bar for maintenance notices',
        tags: ['maintenance', 'announcement', 'notice']
      },
      
      // 6. Full-Width Banner
      {
        title: 'Festival Special Offer',
        campaignName: 'Festival Sale 2026',
        adType: 'full-width-banner',
        status: 'active',
        priority: 'high',
        headline: '🎊 Festival Special: Celebrate with 60% Off!',
        subHeadline: 'Best deals of the season',
        description: 'Join thousands of businesses already using ScanBit. Start your free trial today!',
        ctaButtonText: 'Start Free Trial',
        ctaButtonLink: '/register',
        ctaType: 'internal',
        backgroundColor: '#10b981',
        textColor: '#ffffff',
        gradient: {
          enabled: true,
          colors: ['#10b981', '#34d399'],
          direction: 'to-right'
        },
        pageTargeting: ['home'],
        businessCategoryTargeting: ['all'],
        startDate: startDate,
        endDate: endDate,
        schedulingRules: {
          showOnlyOnWeekends: false,
          showXTimesPerUser: null,
          showOncePerSession: false,
          delaySeconds: 0,
          scrollTriggerPercent: null
        },
        displaySettings: {
          position: 'top',
          width: '100%',
          height: '200px',
          zIndex: 100,
          closeable: false,
          dismissible: false,
          showOnMobile: true,
          showOnDesktop: true
        },
        notes: 'Demo full-width banner for festival promotions',
        tags: ['festival', 'promotion', 'banner']
      },
      
      // 7. CTA Floating Button
      {
        title: 'WhatsApp Support Button',
        campaignName: 'Support CTA Campaign',
        adType: 'cta-floating-button',
        status: 'active',
        priority: 'medium',
        headline: 'Need Help?',
        subHeadline: 'Chat with us on WhatsApp',
        description: 'Get instant support from our team',
        ctaButtonText: '💬 Chat Now',
        ctaButtonLink: 'https://wa.me/916390420225',
        ctaType: 'whatsapp',
        backgroundColor: '#25d366',
        textColor: '#ffffff',
        pageTargeting: ['home', 'menu', 'product-listing', 'product-detail', 'contact'],
        businessCategoryTargeting: ['all'],
        startDate: startDate,
        endDate: endDate,
        schedulingRules: {
          showOnlyOnWeekends: false,
          showXTimesPerUser: null,
          showOncePerSession: false,
          delaySeconds: 0,
          scrollTriggerPercent: null
        },
        displaySettings: {
          position: 'floating',
          width: '60px',
          height: '60px',
          zIndex: 9999,
          closeable: false,
          dismissible: false,
          showOnMobile: true,
          showOnDesktop: true
        },
        notes: 'Demo floating CTA button for WhatsApp support',
        tags: ['support', 'whatsapp', 'floating']
      },
      
      // 8. Exit Intent Popup
      {
        title: 'Exit Intent Special Offer',
        campaignName: 'Exit Intent Campaign',
        adType: 'exit-intent-popup',
        status: 'active',
        priority: 'high',
        headline: 'Wait! Don\'t Go Yet! 🎁',
        subHeadline: 'Get 20% Off Your First Month',
        description: 'We hate to see you leave! Here\'s a special discount just for you. Use code: WELCOME20',
        ctaButtonText: 'Claim Discount',
        ctaButtonLink: '/register?promo=WELCOME20',
        ctaType: 'internal',
        backgroundColor: '#ec4899',
        textColor: '#ffffff',
        gradient: {
          enabled: true,
          colors: ['#ec4899', '#f472b6'],
          direction: 'diagonal'
        },
        pageTargeting: ['home', 'menu'],
        businessCategoryTargeting: ['all'],
        startDate: startDate,
        endDate: endDate,
        schedulingRules: {
          showOnlyOnWeekends: false,
          showXTimesPerUser: 1,
          showOncePerSession: true,
          delaySeconds: 0,
          scrollTriggerPercent: null
        },
        displaySettings: {
          position: 'center',
          width: '450px',
          height: 'auto',
          zIndex: 10000,
          closeable: true,
          dismissible: true,
          showOnMobile: false,
          showOnDesktop: true
        },
        notes: 'Demo exit intent popup to reduce bounce rate',
        tags: ['exit-intent', 'discount', 'retention']
      }
    ];
    
    const results = {
      created: [],
      updated: [],
      errors: []
    };
    
    for (const adData of demoAds) {
      try {
        const existingAd = await Advertisement.findOne({
          title: adData.title,
          adType: adData.adType
        });
        
        if (existingAd) {
          Object.assign(existingAd, {
            ...adData,
            updatedBy: req.user.id,
            updatedAt: new Date()
          });
          await existingAd.save();
          results.updated.push({ title: adData.title, type: adData.adType });
        } else {
          const advertisement = new Advertisement({
            ...adData,
            createdBy: req.user.id,
            updatedBy: req.user.id
          });
          await advertisement.save();
          results.created.push({ title: adData.title, type: adData.adType });
        }
      } catch (error) {

        results.errors.push({ 
          title: adData.title, 
          type: adData.adType, 
          error: error.message 
        });
      }
    }
    
    res.json({
      success: true,
      message: `Seeded ${results.created.length} new advertisements and updated ${results.updated.length} existing ones`,
      results
    });
  } catch (error) {

    res.status(500).json({
      success: false,
      message: 'Failed to seed advertisements',
      error: error.message
    });
  }
});

export default router;
