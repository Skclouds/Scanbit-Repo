import express from 'express';

import { protect } from '../middleware/auth.js';
import Plan from '../models/Plan.js';

/** Item-type label by business category for capability text */
function getItemLabel(businessCategory) {
  const cat = (businessCategory || '').toLowerCase();
  if (cat.includes('retail') || cat.includes('e-commerce')) return 'Products';
  if (cat.includes('creative') || cat.includes('design') || cat.includes('agencies') || cat.includes('studios')) return 'Portfolio items';
  return 'Menu items';
}

/** Build display capabilities from plan.features when featuresList is empty */
function buildCapabilitiesFromFeatures(plan, itemLabel) {
  const f = plan.features || {};
  const list = [];
  const limit = f.menuItemsLimit || 'unlimited';
  if (limit === 'unlimited') {
    list.push(`Unlimited ${itemLabel}`);
  } else {
    list.push(`Up to ${limit} ${itemLabel}`);
  }
  const scans = f.qrScansLimit || 'unlimited';
  list.push(scans === 'unlimited' ? 'Unlimited QR scans' : `Up to ${scans} QR scans per month`);
  if (f.analytics) list.push('Analytics & insights');
  if (f.customBranding) list.push('Custom branding');
  if (f.customDomain) list.push('Custom domain');
  if (f.prioritySupport) list.push('Priority support');
  if (f.apiAccess) list.push('API access');
  return list;
}

/** Default capabilities when plan is not in DB (e.g. Free plan) */
function getDefaultCapabilities(planName, businessCategory) {
  const itemLabel = getItemLabel(businessCategory);
  const name = (planName || 'Free').toLowerCase();
  if (name === 'free') {
    return [
      `Up to 10 ${itemLabel}`,
      'Basic QR code',
      '1 category',
      'Mobile-optimized',
      'Basic analytics',
      'Custom branding (upgrade)',
      'Priority support (upgrade)',
      'Advanced analytics (upgrade)',
    ];
  }
  if (name === 'basic' || name.includes('starter') || name.includes('launch')) {
    return [
      `Up to 100 ${itemLabel}`,
      'Branded QR codes',
      'Unlimited categories',
      'Custom branding',
      'Basic analytics',
      'Email support',
      'Priority support (upgrade)',
      'API access (upgrade)',
    ];
  }
  return [
    `Unlimited ${itemLabel}`,
    'Custom branded QR codes',
    'Unlimited categories',
    'Full custom branding',
    'Advanced analytics',
    'Priority 24/7 support',
    'API access',
    'Multiple locations',
  ];
}

const router = express.Router();

// @route   GET /api/plans/capabilities
// @desc    Get plan capabilities for display (by planName + businessCategory). Used by subscription page.
// @access  Public
router.get('/capabilities', async (req, res) => {
  try {
    const planName = (req.query.planName || req.query.plan || 'Free').trim();
    const businessCategory = (req.query.businessCategory || req.query.category || 'All').trim();

    const itemLabel = getItemLabel(businessCategory);

    let plan = await Plan.findOne({
      name: { $regex: new RegExp(`^${planName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, 'i') },
      businessCategory: businessCategory,
      isActive: true,
    }).select('name description features featuresList');

    if (!plan && businessCategory !== 'All') {
      plan = await Plan.findOne({
        name: { $regex: new RegExp(`^${planName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, 'i') },
        businessCategory: 'All',
        isActive: true,
      }).select('name description features featuresList');
    }

    let capabilities = [];
    let description = '';
    let resolvedPlanName = planName;

    if (plan) {
      resolvedPlanName = plan.name;
      description = plan.description || '';
      const list = (plan.featuresList && plan.featuresList.length > 0)
        ? plan.featuresList
        : buildCapabilitiesFromFeatures(plan, itemLabel);
      capabilities = list.filter(Boolean);
    } else {
      capabilities = getDefaultCapabilities(planName, businessCategory);
    }

    return res.json({
      success: true,
      data: {
        planName: resolvedPlanName,
        businessCategory,
        description,
        capabilities,
        itemLabel,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to fetch plan capabilities',
    });
  }
});

// @route   GET /api/plans
// @desc    Get all active plans (public endpoint) + custom plans for authenticated user
// @access  Public (shows custom plans if authenticated)
router.get('/', async (req, res) => {
  try {
    const { businessCategory } = req.query;
    const userId = req.user?._id; // Get user ID if authenticated
    
    const query = { isActive: true, isCustom: false }; // Default: only regular plans
    if (businessCategory && businessCategory !== 'all') {
      query.businessCategory = businessCategory;
    }

    // Get regular plans
    const regularPlans = await Plan.find(query)
      .sort({ businessCategory: 1, price: 1 })
      .select('-createdBy -updatedBy -__v');

    let customPlans = [];
    // Get custom plans for this user if authenticated
    if (userId) {
      customPlans = await Plan.find({
        isActive: true,
        isCustom: true,
        assignedToUser: userId
      })
        .sort({ businessCategory: 1, price: 1 })
        .select('-createdBy -updatedBy -__v');
    }

    // Combine regular and custom plans
    const allPlans = [...customPlans, ...regularPlans];

    // Group plans by business category
    const groupedPlans = allPlans.reduce((acc, plan) => {
      const category = plan.businessCategory;
      if (!acc[category]) {
        acc[category] = [];
      }
      acc[category].push(plan);
      return acc;
    }, {});

    res.json({
      success: true,
      data: allPlans,
      grouped: groupedPlans,
      customPlansCount: customPlans.length
    });
  } catch (error) {

    res.status(500).json({
      success: false,
      message: 'Failed to fetch plans'
    });
  }
});

// @route   GET /api/plans/:category
// @desc    Get plans by business category
// @access  Public
router.get('/:category', async (req, res) => {
  try {
    const { category } = req.params;
    const userId = req.user?._id;
    
    const plans = await Plan.find({
      businessCategory: category,
      isActive: true,
      isCustom: false
    })
      .sort({ price: 1 })
      .select('-createdBy -updatedBy -__v');

    let customPlans = [];
    if (userId) {
      customPlans = await Plan.find({
        isActive: true,
        isCustom: true,
        assignedToUser: userId,
        businessCategory: category
      })
        .sort({ price: 1 })
        .select('-createdBy -updatedBy -__v');
    }

    res.json({
      success: true,
      data: [...customPlans, ...plans]
    });
  } catch (error) {

    res.status(500).json({
      success: false,
      message: 'Failed to fetch plans'
    });
  }
});

export default router;
