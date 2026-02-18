import express from 'express';
import Restaurant from '../models/Restaurant.js';
import MenuItem from '../models/MenuItem.js';
import QRScan from '../models/QRScan.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// @route   GET /api/analytics/dashboard
// @desc    Get dashboard analytics
// @access  Private
router.get('/dashboard', protect, async (req, res) => {
  try {
    const restaurantId = req.user.restaurant;
    const timeRange = req.query.timeRange || 'week'; // today, week, month, year
    
    if (!restaurantId) {
      return res.status(400).json({
        success: false,
        message: 'User must be associated with a restaurant'
      });
    }

    const restaurant = await Restaurant.findById(restaurantId);
    
    // Calculate date range based on timeRange parameter
    const now = new Date();
    let startDate = new Date();
    
    switch (timeRange) {
      case 'today':
        startDate.setHours(0, 0, 0, 0);
        break;
      case 'week':
        startDate.setDate(startDate.getDate() - 7);
        startDate.setHours(0, 0, 0, 0);
        break;
      case 'month':
        startDate.setMonth(startDate.getMonth() - 1);
        startDate.setHours(0, 0, 0, 0);
        break;
      case 'year':
        startDate.setFullYear(startDate.getFullYear() - 1);
        startDate.setHours(0, 0, 0, 0);
        break;
      default:
        startDate.setDate(startDate.getDate() - 7);
        startDate.setHours(0, 0, 0, 0);
    }
    
    // Get popular items
    const popularItems = await MenuItem.find({
      restaurant: restaurantId,
      isPopular: true,
      isAvailable: true
    })
    .sort({ views: -1 })
    .limit(10)
    .populate('category', 'name emoji');

    // Get scan statistics based on time range
    const totalScans = await QRScan.countDocuments({ restaurant: restaurantId });
    
    const rangeScans = await QRScan.countDocuments({
      restaurant: restaurantId,
      scannedAt: { $gte: startDate }
    });
    
    const thisMonth = new Date();
    thisMonth.setDate(1);
    const thisMonthScans = await QRScan.countDocuments({
      restaurant: restaurantId,
      scannedAt: { $gte: thisMonth }
    });

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayScans = await QRScan.countDocuments({
      restaurant: restaurantId,
      scannedAt: { $gte: today }
    });

    // Calculate average daily scans
    const firstScan = await QRScan.findOne({ restaurant: restaurantId })
      .sort({ scannedAt: 1 });
    
    let avgDailyScans = 0;
    if (firstScan) {
      const daysDiff = Math.max(1, Math.ceil((new Date() - firstScan.scannedAt) / (1000 * 60 * 60 * 24)));
      avgDailyScans = Math.round(totalScans / daysDiff);
    }

    // Get scans by day based on time range
    let scansByDay = [];
    let dateFormat = "%Y-%m-%d";
    let groupByFormat = "day";
    
    if (timeRange === 'today') {
      // Hourly data for today
      const scansByHourData = await QRScan.aggregate([
        {
          $match: {
            restaurant: restaurantId,
            scannedAt: { $gte: startDate }
          }
        },
        {
          $group: {
            _id: { $hour: "$scannedAt" },
            scans: { $sum: 1 }
          }
        },
        {
          $sort: { _id: 1 }
        }
      ]);
      
      for (let hour = 0; hour < 24; hour++) {
        const hourData = scansByHourData.find(d => d._id === hour);
        scansByDay.push({
          day: `${hour}:00`,
          scans: hourData ? hourData.scans : 0
        });
      }
    } else if (timeRange === 'week') {
      // Daily data for last 7 days
      const scansByDayData = await QRScan.aggregate([
        {
          $match: {
            restaurant: restaurantId,
            scannedAt: { $gte: startDate }
          }
        },
        {
          $group: {
            _id: {
              $dateToString: { format: "%Y-%m-%d", date: "$scannedAt" }
            },
            scans: { $sum: 1 }
          }
        },
        {
          $sort: { _id: 1 }
        }
      ]);

      for (let i = 6; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        date.setHours(0, 0, 0, 0);
        const dateStr = date.toISOString().split('T')[0];
        const dayName = date.toLocaleDateString('en-US', { weekday: 'short' });
        
        const dayData = scansByDayData.find(d => d._id === dateStr);
        scansByDay.push({
          day: dayName,
          scans: dayData ? dayData.scans : 0
        });
      }
    } else if (timeRange === 'month') {
      // Weekly data for last 4 weeks
      const scansByWeekData = await QRScan.aggregate([
        {
          $match: {
            restaurant: restaurantId,
            scannedAt: { $gte: startDate }
          }
        },
        {
          $group: {
            _id: {
              $dateToString: { format: "%Y-W%V", date: "$scannedAt" }
            },
            scans: { $sum: 1 }
          }
        },
        {
          $sort: { _id: 1 }
        }
      ]);

      for (let i = 3; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - (i * 7));
        const weekLabel = `Week ${4 - i}`;
        
        const weekData = scansByWeekData[i];
        scansByDay.push({
          day: weekLabel,
          scans: weekData ? weekData.scans : 0
        });
      }
    } else if (timeRange === 'year') {
      // Monthly data for last 12 months
      const scansByMonthData = await QRScan.aggregate([
        {
          $match: {
            restaurant: restaurantId,
            scannedAt: { $gte: startDate }
          }
        },
        {
          $group: {
            _id: {
              $dateToString: { format: "%Y-%m", date: "$scannedAt" }
            },
            scans: { $sum: 1 }
          }
        },
        {
          $sort: { _id: 1 }
        }
      ]);

      for (let i = 11; i >= 0; i--) {
        const date = new Date();
        date.setMonth(date.getMonth() - i);
        const monthName = date.toLocaleDateString('en-US', { month: 'short' });
        
        const monthData = scansByMonthData.find(d => d._id === `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`);
        scansByDay.push({
          day: monthName,
          scans: monthData ? monthData.scans : 0
        });
      }
    }

    // Get device statistics
    const allScans = await QRScan.find({ restaurant: restaurantId }).select('userAgent');
    const total = allScans.length;
    let mobile = 0;
    let tablet = 0;
    
    allScans.forEach(scan => {
      const ua = (scan.userAgent || '').toLowerCase();
      if (ua.includes('mobile') || ua.includes('android') || ua.includes('iphone')) {
        mobile++;
      }
      if (ua.includes('ipad') || ua.includes('tablet')) {
        tablet++;
      }
    });

    let deviceStats = { mobile: 75, desktop: 20, tablet: 5 };
    if (total > 0) {
      const mobilePercent = Math.round((mobile / total) * 100);
      const tabletPercent = Math.round((tablet / total) * 100);
      const desktopPercent = 100 - mobilePercent - tabletPercent;
      deviceStats = {
        mobile: mobilePercent,
        desktop: desktopPercent,
        tablet: tabletPercent
      };
    }

    // Get peak hours (hourly distribution) - filter by time range
    const peakHoursData = await QRScan.aggregate([
      {
        $match: {
          restaurant: restaurantId,
          scannedAt: { $gte: startDate }
        }
      },
      {
        $group: {
          _id: { $hour: "$scannedAt" },
          scans: { $sum: 1 }
        }
      },
      {
        $sort: { scans: -1 }
      },
      {
        $limit: 5
      }
    ]);

    const peakHours = peakHoursData.map(item => ({
      time: `${item._id}:00`,
      scans: item.scans
    })).sort((a, b) => {
      const hourA = parseInt(a.time.split(':')[0]);
      const hourB = parseInt(b.time.split(':')[0]);
      return hourB - hourA;
    });

    // Get category statistics (for menu items views)
    const categoryStatsData = await MenuItem.aggregate([
      {
        $match: { restaurant: restaurantId }
      },
      {
        $group: {
          _id: "$category",
          views: { $sum: "$views" || 0 }
        }
      },
      {
        $lookup: {
          from: 'categories',
          localField: '_id',
          foreignField: '_id',
          as: 'categoryInfo'
        }
      },
      {
        $unwind: { path: '$categoryInfo', preserveNullAndEmptyArrays: true }
      },
      {
        $project: {
          name: { $ifNull: ['$categoryInfo.name', 'Uncategorized'] },
          views: 1
        }
      },
      {
        $sort: { views: -1 }
      },
      {
        $limit: 5
      }
    ]);

    const categoryStats = categoryStatsData.map(item => ({
      name: item.name || 'Uncategorized',
      views: item.views || 0
    }));

    // Calculate growth percentage
    const lastMonth = new Date();
    lastMonth.setMonth(lastMonth.getMonth() - 1);
    lastMonth.setDate(1);
    const lastMonthEnd = new Date();
    lastMonthEnd.setMonth(lastMonthEnd.getMonth() - 1);
    lastMonthEnd.setDate(0);
    
    const lastMonthScans = await QRScan.countDocuments({
      restaurant: restaurantId,
      scannedAt: { $gte: lastMonth, $lte: lastMonthEnd }
    });

    let growthPercentage = 0;
    if (lastMonthScans > 0) {
      growthPercentage = Math.round(((thisMonthScans - lastMonthScans) / lastMonthScans) * 100);
    } else if (thisMonthScans > 0) {
      growthPercentage = 100;
    }

    res.json({
      success: true,
      data: {
        restaurant: {
          name: restaurant.name,
          plan: restaurant.subscription?.plan,
          subscriptionEnd: restaurant.subscription?.endDate,
          daysRemaining: restaurant.subscription?.daysRemaining
        },
        stats: {
          totalScans,
          rangeScans,
          thisMonthScans,
          todayScans,
          avgDailyScans,
          growthPercentage
        },
        scansByDay,
        deviceStats,
        peakHours: peakHours.length > 0 ? peakHours : [
          { time: '12:00', scans: 0 },
          { time: '18:00', scans: 0 },
          { time: '20:00', scans: 0 }
        ],
        categoryStats: categoryStats.length > 0 ? categoryStats : [
          { name: 'All Items', views: 0 }
        ],
        popularItems: popularItems.map(item => ({
          id: item._id,
          name: item.name,
          category: item.category?.name || 'Uncategorized',
          price: item.price,
          views: item.views || 0
        }))
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
