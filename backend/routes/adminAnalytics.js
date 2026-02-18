import express from 'express';
import Restaurant from '../models/Restaurant.js';
import User from '../models/User.js';
import BusinessCategory from '../models/BusinessCategory.js';
import Plan from '../models/Plan.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

// Get subscription analytics
router.get('/subscriptions/analytics', protect, authorize('admin'), async (req, res) => {
  try {
    // Get all restaurants with their subscriptions
    const restaurants = await Restaurant.find({ isArchived: false })
      .populate('owner', 'businessCategory businessType')
      .lean();

    // Group by business category
    const categoryStats = {};
    const planDistribution = {};

    restaurants.forEach(restaurant => {
      const category = restaurant.businessCategory || 'Unknown';
      const plan = restaurant.subscription?.plan || 'Free';

      // Initialize category if not exists
      if (!categoryStats[category]) {
        categoryStats[category] = {
          category: category,
          free: 0,
          basic: 0,
          pro: 0,
          total: 0
        };
      }

      // Count by plan type
      const planLower = plan.toLowerCase();
      if (planLower === 'free') {
        categoryStats[category].free++;
      } else if (planLower === 'basic') {
        categoryStats[category].basic++;
      } else if (planLower === 'pro') {
        categoryStats[category].pro++;
      }
      categoryStats[category].total++;

      // Plan distribution
      if (!planDistribution[plan]) {
        planDistribution[plan] = { name: plan, count: 0 };
      }
      planDistribution[plan].count++;
    });

    const byCategory = Object.values(categoryStats);
    const planDistributionArray = Object.values(planDistribution);

    res.json({
      byCategory,
      planDistribution: planDistributionArray,
      totalBusinesses: restaurants.length
    });
  } catch (error) {

    res.status(500).json({ message: 'Server error' });
  }
});

// Get comprehensive category analytics for Categories page
router.get('/categories-analytics', protect, authorize('admin'), async (req, res) => {
  try {
    
    // Get all businesses (not archived)
    const allBusinesses = await Restaurant.find({ 
      $or: [
        { isArchived: { $ne: true } },
        { isArchived: { $exists: false } }
      ]
    })
    .populate('owner', 'name email')
    .lean();

    // Get categories from BusinessCategory model (dynamic)
    let mainCategories = [];
    try {
      const dbCategories = await BusinessCategory.find({ isActive: true })
        .sort({ order: 1, name: 1 })
        .lean();
      
      if (dbCategories && dbCategories.length > 0) {
        mainCategories = dbCategories.map(cat => cat.name);
      }
    } catch (error) {
      // If BusinessCategory fetch fails, continue with fallback
    }

    // Fallback: Get unique categories from businesses if no categories in database
    if (mainCategories.length === 0) {
      const uniqueCategories = new Set();
      allBusinesses.forEach(business => {
        if (business.businessCategory && business.businessCategory.trim()) {
          uniqueCategories.add(business.businessCategory);
        }
      });
      mainCategories = Array.from(uniqueCategories).sort();
    }

    // Final fallback to default categories
    if (mainCategories.length === 0) {
      mainCategories = [
        'Food Mall',
        'Retail / E-Commerce Businesses', 
        'Creative & Design'
      ];
    }

    // Process analytics for each category
    const categoryAnalytics = mainCategories.map(categoryName => {
      // Filter businesses for this category
      const categoryBusinesses = allBusinesses.filter(business => 
        business.businessCategory === categoryName
      );

      // Calculate verification stats
      const verified = categoryBusinesses.filter(b => b.isVerified === true).length;
      const pending = categoryBusinesses.filter(b => 
        b.isVerified !== true && b.verificationStatus !== 'rejected'
      ).length;
      const rejected = categoryBusinesses.filter(b => 
        b.verificationStatus === 'rejected'
      ).length;

      // Calculate subscription stats
      const active = categoryBusinesses.filter(b => 
        b.subscription?.status === 'active'
      ).length;
      const inactive = categoryBusinesses.length - active;

      // Calculate plan distribution
      const planStats = {
        Free: categoryBusinesses.filter(b => (b.subscription?.plan || 'Free') === 'Free').length,
        Basic: categoryBusinesses.filter(b => b.subscription?.plan === 'Basic').length,
        Pro: categoryBusinesses.filter(b => b.subscription?.plan === 'Pro').length,
      };

      // Calculate revenue
      const totalRevenue = categoryBusinesses.reduce((sum, business) => {
        return sum + (business.subscription?.planPrice || 0);
      }, 0);

      // Get business types within this category
      const businessTypes = {};
      categoryBusinesses.forEach(business => {
        const type = business.businessType || 'Unknown';
        if (!businessTypes[type]) {
          businessTypes[type] = {
            name: type,
            count: 0,
            verified: 0,
            pending: 0,
            active: 0
          };
        }
        businessTypes[type].count++;
        if (business.isVerified) businessTypes[type].verified++;
        if (!business.isVerified && business.verificationStatus !== 'rejected') businessTypes[type].pending++;
        if (business.subscription?.status === 'active') businessTypes[type].active++;
      });

      return {
        name: categoryName,
        total: categoryBusinesses.length,
        verified,
        pending,
        rejected,
        active,
        inactive,
        planStats,
        totalRevenue,
        businessTypes: Object.values(businessTypes).sort((a, b) => b.count - a.count),
        percentage: allBusinesses.length > 0 ? Math.round((categoryBusinesses.length / allBusinesses.length) * 100) : 0,
        verificationRate: categoryBusinesses.length > 0 ? Math.round((verified / categoryBusinesses.length) * 100) : 0,
        businesses: categoryBusinesses.slice(0, 10) // Top 10 businesses for preview
      };
    });

    // Calculate totals
    const totals = {
      totalBusinesses: allBusinesses.length,
      totalVerified: categoryAnalytics.reduce((sum, cat) => sum + cat.verified, 0),
      totalPending: categoryAnalytics.reduce((sum, cat) => sum + cat.pending, 0),
      totalRejected: categoryAnalytics.reduce((sum, cat) => sum + cat.rejected, 0),
      totalActive: categoryAnalytics.reduce((sum, cat) => sum + cat.active, 0),
      totalRevenue: categoryAnalytics.reduce((sum, cat) => sum + cat.totalRevenue, 0),
    };

    // Sort categories by total businesses (descending)
    categoryAnalytics.sort((a, b) => b.total - a.total);

    res.json({
      success: true,
      data: {
        categories: categoryAnalytics,
        totals,
        lastUpdated: new Date().toISOString()
      }
    });

  } catch (error) {

    res.status(500).json({ 
      success: false,
      message: 'Failed to fetch category analytics',
      error: error.message 
    });
  }
});

// Get business categories with statistics
router.get('/business-categories', protect, authorize('admin'), async (req, res) => {
  try {
    const categories = await BusinessCategory.find({ isActive: true }).lean();
    
    // Get statistics for each category
    const categoriesWithStats = await Promise.all(
      categories.map(async (category) => {
        // Count businesses in this category
        const businessCount = await Restaurant.countDocuments({
          businessCategory: category.name,
          isArchived: false
        });

        // Get businesses for revenue calculation
        const businesses = await Restaurant.find({
          businessCategory: category.name,
          isArchived: false
        }).lean();

        // Calculate total revenue
        const totalRevenue = businesses.reduce((sum, business) => {
          return sum + (business.subscription?.planPrice || 0);
        }, 0);

        // Calculate subscription stats
        const subscriptionStats = {
          free: 0,
          basic: 0,
          pro: 0
        };

        businesses.forEach(business => {
          const plan = (business.subscription?.plan || 'Free').toLowerCase();
          if (plan === 'free') subscriptionStats.free++;
          else if (plan === 'basic') subscriptionStats.basic++;
          else if (plan === 'pro') subscriptionStats.pro++;
        });

        return {
          ...category,
          businessCount,
          totalRevenue,
          subscriptionStats
        };
      })
    );

    res.json(categoriesWithStats);
  } catch (error) {

    res.status(500).json({ message: 'Server error' });
  }
});

// Get plans
router.get('/plans', protect, authorize('admin'), async (req, res) => {
  try {
    const plans = await Plan.find({ isActive: true }).lean();
    res.json(plans);
  } catch (error) {

    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Get overall stats (overview analytics)
router.get('/overview', protect, authorize('admin'), async (req, res) => {
  try {
    const [totalUsers, totalRestaurants, activeSubscriptions, pendingApprovals] = await Promise.all([
      User.countDocuments({ role: 'user' }),
      Restaurant.countDocuments({ isArchived: false }),
      Restaurant.countDocuments({ 
        'subscription.status': 'active',
        isArchived: false 
      }),
      Restaurant.countDocuments({ 
        verificationStatus: 'pending',
        isArchived: false 
      })
    ]);

    // Calculate total revenue
    const restaurants = await Restaurant.find({ 
      isArchived: false,
      'subscription.status': 'active'
    }).lean();

    const totalRevenue = restaurants.reduce((sum, restaurant) => {
      return sum + (restaurant.subscription?.planPrice || 0);
    }, 0);

    // Calculate total QR scans
    const totalQRScans = restaurants.reduce((sum, restaurant) => {
      return sum + (restaurant.qrScans || 0);
    }, 0);

    res.json({
      totalUsers,
      totalRestaurants,
      totalRevenue,
      totalQRScans,
      activeSubscriptions,
      pendingApprovals
    });
  } catch (error) {

    res.status(500).json({ message: 'Server error' });
  }
});

// Get overall stats (backward compatibility)
router.get('/stats', protect, authorize('admin'), async (req, res) => {
  try {
    const [totalUsers, totalRestaurants, activeSubscriptions, pendingApprovals] = await Promise.all([
      User.countDocuments({ role: 'user' }),
      Restaurant.countDocuments({ isArchived: false }),
      Restaurant.countDocuments({ 
        'subscription.status': 'active',
        isArchived: false 
      }),
      Restaurant.countDocuments({ 
        verificationStatus: 'pending',
        isArchived: false 
      })
    ]);

    // Calculate total revenue
    const restaurants = await Restaurant.find({ 
      isArchived: false,
      'subscription.status': 'active'
    }).lean();

    const totalRevenue = restaurants.reduce((sum, restaurant) => {
      return sum + (restaurant.subscription?.planPrice || 0);
    }, 0);

    // Calculate total QR scans
    const totalQRScans = restaurants.reduce((sum, restaurant) => {
      return sum + (restaurant.qrScans || 0);
    }, 0);

    res.json({
      totalUsers,
      totalRestaurants,
      totalRevenue,
      totalQRScans,
      activeSubscriptions,
      pendingApprovals
    });
  } catch (error) {

    res.status(500).json({ message: 'Server error' });
  }
});

// Get business analytics (was user analytics)
router.get('/businesses', protect, authorize('admin'), async (req, res) => {
  try {
    // Generate monthly business registration data
    const restaurants = await Restaurant.find({ isArchived: false }).lean();
    
    const monthlyData = {};
    const currentDate = new Date();
    
    // Initialize last 12 months
    for (let i = 11; i >= 0; i--) {
      const date = new Date(currentDate.getFullYear(), currentDate.getMonth() - i, 1);
      const monthKey = date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
      monthlyData[monthKey] = 0;
    }

    // Count businesses by month
    restaurants.forEach(restaurant => {
      const restaurantDate = new Date(restaurant.createdAt);
      const monthKey = restaurantDate.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
      if (monthlyData[monthKey] !== undefined) {
        monthlyData[monthKey]++;
      }
    });

    const chartData = Object.entries(monthlyData).map(([month, businesses]) => ({
      month,
      businesses
    }));

    res.json({
      success: true,
      data: chartData
    });
  } catch (error) {

    res.status(500).json({ 
      success: false,
      message: 'Server error' 
    });
  }
});

// Get revenue analytics
router.get('/revenue', protect, authorize('admin'), async (req, res) => {
  try {
    // Generate mock monthly revenue data
    const restaurants = await Restaurant.find({ 
      isArchived: false,
      'subscription.status': 'active'
    }).lean();
    
    const monthlyRevenue = {};
    const currentDate = new Date();
    
    // Initialize last 12 months
    for (let i = 11; i >= 0; i--) {
      const date = new Date(currentDate.getFullYear(), currentDate.getMonth() - i, 1);
      const monthKey = date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
      monthlyRevenue[monthKey] = 0;
    }

    // Calculate revenue by month (simplified - using subscription start dates)
    restaurants.forEach(restaurant => {
      if (restaurant.subscription?.startDate) {
        const startDate = new Date(restaurant.subscription.startDate);
        const monthKey = startDate.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
        if (monthlyRevenue[monthKey] !== undefined) {
          monthlyRevenue[monthKey] += restaurant.subscription.planPrice || 0;
        }
      }
    });

    const revenueData = Object.entries(monthlyRevenue).map(([month, revenue]) => ({
      month,
      revenue
    }));

    res.json({
      success: true,
      data: revenueData
    });
  } catch (error) {

    res.status(500).json({ 
      success: false,
      message: 'Server error' 
    });
  }
});

export default router;