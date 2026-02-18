import express from 'express';

import Restaurant from '../models/Restaurant.js';
import MenuItem from '../models/MenuItem.js';
import Category from '../models/Category.js';
import QRScan from '../models/QRScan.js';

const DAYS = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'];
const DAY_LABELS = { mon: 'Monday', tue: 'Tuesday', wed: 'Wednesday', thu: 'Thursday', fri: 'Friday', sat: 'Saturday', sun: 'Sunday' };

function formatTime24to12(v) {
  if (!v || typeof v !== 'string') return '—';
  const [h, m] = v.split(':').map(Number);
  const hour12 = h % 12 || 12;
  const ampm = h < 12 ? 'AM' : 'PM';
  return `${hour12}:${String(m || 0).padStart(2, '0')} ${ampm}`;
}

function openingHoursFromSchedule(schedule) {
  if (!schedule || typeof schedule !== 'object') return null;
  const parts = [];
  let i = 0;
  while (i < DAYS.length) {
    const d = DAYS[i];
    const s = schedule[d];
    if (!s || s.closed) {
      i++;
      continue;
    }
    const open = formatTime24to12(s.open);
    const close = formatTime24to12(s.close);
    let j = i + 1;
    while (j < DAYS.length) {
      const t = schedule[DAYS[j]];
      if (!t || t.closed || t.open !== s.open || t.close !== s.close) break;
      j++;
    }
    const dayRange = j - i === 1
      ? DAY_LABELS[d]
      : `${(DAY_LABELS[DAYS[i]] || '').slice(0, 3)}–${(DAY_LABELS[DAYS[j - 1]] || '').slice(0, 3)}`;
    parts.push(`${dayRange} ${open} – ${close}`);
    i = j;
  }
  const closed = DAYS.filter((d) => schedule[d]?.closed).map((d) => (DAY_LABELS[d] || d).slice(0, 3));
  if (closed.length) parts.push(`${closed.join(', ')} closed`);
  return parts.length ? parts.join('; ') : null;
}

const router = express.Router();

// @route   GET /api/menus/:restaurantId
// @desc    Get complete menu for a restaurant (public). Supports both _id and customSlug.
// @access  Public
router.get('/:restaurantId', async (req, res) => {
  try {
    const { restaurantId } = req.params;
    const isObjectId = /^[0-9a-fA-F]{24}$/.test(restaurantId);

    let restaurant;
    if (isObjectId) {
      restaurant = await Restaurant.findById(restaurantId);
    } else {
      restaurant = await Restaurant.findOne({ customSlug: restaurantId.trim().toLowerCase() });
    }

    if (!restaurant) {
      return res.status(404).json({
        success: false,
        message: 'Restaurant not found'
      });
    }
    

    // Get categories
    const categories = await Category.find({ 
      restaurant: restaurant._id,
      isActive: true 
    }).sort({ order: 1 });

    // Get menu items grouped by category
    const menuData = await Promise.all(
      categories.map(async (category) => {
        const items = await MenuItem.find({
          category: category._id,
          isAvailable: true
        }).sort({ order: 1, createdAt: -1 });

        return {
          id: category._id,
          name: category.name,
          emoji: category.emoji,
          items: items.map(item => ({
            id: item._id,
            name: item.name,
            description: item.description,
            price: item.price,
            offerPrice: item.offerPrice || null,
            image: item.image,
            isVeg: item.isVeg,
            isSpicy: item.isSpicy,
            isPopular: item.isPopular,
            isAvailable: item.isAvailable
          }))
        };
      })
    );

    // Track QR scan
    const ipAddress = req.ip || req.connection.remoteAddress;
    const userAgent = req.get('user-agent');
    
    await QRScan.create({
      restaurant: restaurant._id,
      ipAddress,
      userAgent
    });

    // Update restaurant scan counts
    restaurant.qrScans += 1;
    const thisMonth = new Date();
    thisMonth.setDate(1);
    const thisMonthScans = await QRScan.countDocuments({
      restaurant: restaurant._id,
      scannedAt: { $gte: thisMonth }
    });
    restaurant.qrScansThisMonth = thisMonthScans;
    await restaurant.save();

    const loc = restaurant.location;
    const addressStr = loc?.address || (restaurant.address && typeof restaurant.address === 'object'
      ? [restaurant.address.street, restaurant.address.city, restaurant.address.state, restaurant.address.zipCode].filter(Boolean).join(', ')
      : null) || (typeof restaurant.address === 'string' ? restaurant.address : null);

    const openingHours =
      (restaurant.openingHours && String(restaurant.openingHours).trim()) ||
      openingHoursFromSchedule(restaurant.openingHoursSchedule) ||
      null;

    res.json({
      success: true,
      restaurant: {
        id: restaurant._id,
        name: restaurant.name,
        businessType: restaurant.businessType,
        businessCategory: restaurant.businessCategory || null,
        logo: restaurant.logo,
        ownerImage: restaurant.ownerImage || null,
        tagline: restaurant.tagline || 'Fresh • Local • Delicious',
        businessCardFront: restaurant.businessCardFront || restaurant.businessCard || null,
        businessCardBack: restaurant.businessCardBack || null,
        businessCard: restaurant.businessCardFront || restaurant.businessCard || null,
        foodImages: restaurant.foodImages || [],
        location: (loc || addressStr) ? { lat: loc?.lat ?? null, lng: loc?.lng ?? null, address: loc?.address || addressStr } : null,
        address: addressStr,
        phone: restaurant.phone || null,
        email: restaurant.email || null,
        openingHours,
        whatsapp: restaurant.whatsapp || null,
        rating: restaurant.rating ?? null,
        totalReviews: restaurant.totalReviews ?? null,
        website: restaurant.socialMedia?.website || null,
        profile: restaurant.profile || null,
        showQuickActions: restaurant.showQuickActions !== false,
        showSocialLinks: restaurant.showSocialLinks !== false,
        showWhatsAppButton: restaurant.showWhatsAppButton !== false,
        socialMedia: restaurant.socialMedia || {},
        // Portfolio-specific fields
        portfolioGallery: restaurant.portfolioGallery || [],
        portfolioResumeUrl: restaurant.portfolioResumeUrl || null,
        portfolioTitle: restaurant.portfolioTitle || null,
        portfolioMapEmbedUrl: restaurant.portfolioMapEmbedUrl || null,
        portfolioTheme: restaurant.portfolioTheme || 'orange',
        portfolioPracticeAreas: restaurant.portfolioPracticeAreas || [],
        portfolioExperience: restaurant.portfolioExperience || [],
        portfolioProjects: restaurant.portfolioProjects || [],
        portfolioTestimonials: restaurant.portfolioTestimonials || [],
        agencyHeroImageUrl: restaurant.agencyHeroImageUrl || null,
        agencyHeroBackgroundUrl: restaurant.agencyHeroBackgroundUrl || null,
        agencyGallery: restaurant.agencyGallery || [],
        agencyServices: restaurant.agencyServices || []
      },
      categories: menuData
    });
  } catch (error) {

    // Handle mongoose cast errors (invalid ObjectId)
    if (error.name === 'CastError') {
      return res.status(404).json({
        success: false,
        message: 'Restaurant not found. Invalid restaurant ID.'
      });
    }
    
    res.status(500).json({
      success: false,
      message: error.message || 'Server error while fetching menu'
    });
  }
});

export default router;
