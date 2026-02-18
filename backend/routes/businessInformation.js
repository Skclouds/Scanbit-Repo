import express from 'express';
import BusinessInformation from '../models/BusinessInformation.js';
import Restaurant from '../models/Restaurant.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

/**
 * Merge restaurant data into a format matching BusinessInformation for migration/fallback
 */
function restaurantToBusinessInfoFormat(restaurant) {
  if (!restaurant) return null;
  const loc = restaurant.location && typeof restaurant.location.toObject === 'function'
    ? restaurant.location.toObject()
    : restaurant.location || {};
  const soc = restaurant.socialMedia && typeof restaurant.socialMedia.toObject === 'function'
    ? restaurant.socialMedia.toObject()
    : restaurant.socialMedia || {};
  return {
    businessName: restaurant.name,
    tagline: restaurant.tagline,
    profile: restaurant.profile,
    email: restaurant.email,
    phone: restaurant.phone,
    whatsapp: restaurant.whatsapp,
    location: { lat: loc.lat, lng: loc.lng, address: loc.address },
    openingHours: restaurant.openingHours,
    openingHoursSchedule: restaurant.openingHoursSchedule,
    logo: restaurant.logo,
    businessCardFront: restaurant.businessCardFront || restaurant.businessCard,
    businessCardBack: restaurant.businessCardBack,
    socialMedia: soc
  };
}

// @route   GET /api/business-information/me
// @desc    Get current user's business information
// @access  Private
router.get('/me', protect, async (req, res) => {
  try {
    const bizInfo = await BusinessInformation.findOne({ owner: req.user._id });

    if (bizInfo) {
      const plain = bizInfo.toObject ? bizInfo.toObject() : bizInfo;
      return res.json({ success: true, data: plain });
    }

    // Fallback: build from Restaurant for users who haven't migrated yet
    const restaurant = await Restaurant.findOne({ owner: req.user._id });
    if (!restaurant) {
      return res.status(404).json({
        success: false,
        message: 'No business or restaurant found'
      });
    }

    const fallback = restaurantToBusinessInfoFormat(restaurant);
    const merged = {
      _id: null,
      owner: req.user._id,
      restaurant: restaurant._id,
      ...fallback,
      createdAt: restaurant.createdAt,
      updatedAt: restaurant.updatedAt
    };
    res.json({ success: true, data: merged });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Server error'
    });
  }
});

// @route   PUT /api/business-information
// @desc    Create or update current user's business information
// @access  Private
router.put('/', protect, async (req, res) => {
  try {
    const restaurant = await Restaurant.findOne({ owner: req.user._id });
    if (!restaurant) {
      return res.status(404).json({
        success: false,
        message: 'Restaurant not found. Complete onboarding first.'
      });
    }

    const body = req.body;

    const loc = body.location && typeof body.location === 'object' ? body.location : {};
    const soc = body.socialMedia && typeof body.socialMedia === 'object' ? body.socialMedia : {};

    const locationClean = {};
    if (typeof loc.lat === 'number') locationClean.lat = loc.lat;
    if (typeof loc.lng === 'number') locationClean.lng = loc.lng;
    if (loc.address != null && String(loc.address).trim()) locationClean.address = String(loc.address).trim();
    else if ('address' in loc) locationClean.address = null;

    const socialClean = {};
    ['facebook', 'instagram', 'twitter', 'linkedin', 'website'].forEach(k => {
      if (soc[k] != null && String(soc[k]).trim()) socialClean[k] = String(soc[k]).trim();
      else if (soc[k] === '' || soc[k] === null) socialClean[k] = null;
    });

    const payload = {
      owner: req.user._id,
      restaurant: restaurant._id,
      businessName: body.businessName != null ? String(body.businessName).trim() || null : null,
      tagline: body.tagline != null ? String(body.tagline).trim() || null : null,
      profile: body.profile != null ? String(body.profile).trim() || null : null,
      email: body.email != null ? String(body.email).trim().toLowerCase() || null : null,
      phone: body.phone != null ? String(body.phone).trim() || null : null,
      whatsapp: body.whatsapp != null ? String(body.whatsapp).trim() || null : null,
      openingHours: body.openingHours != null ? String(body.openingHours).trim() || null : null,
      openingHoursSchedule: body.openingHoursSchedule ?? null,
      logo: body.logo ?? null,
      businessCardFront: body.businessCardFront ?? null,
      businessCardBack: body.businessCardBack ?? null,
      location: locationClean,
      socialMedia: socialClean
    };

    let bizInfo = await BusinessInformation.findOneAndUpdate(
      { owner: req.user._id },
      { $set: payload },
      { new: true, upsert: true, runValidators: true }
    );

    // Sync key fields to Restaurant for backward compatibility
    const locObj = bizInfo.location && typeof bizInfo.toObject === 'function'
      ? (bizInfo.location.toObject ? bizInfo.location.toObject() : bizInfo.location)
      : bizInfo.location || {};
    const socObj = bizInfo.socialMedia && typeof bizInfo.socialMedia === 'object'
      ? (bizInfo.socialMedia.toObject ? bizInfo.socialMedia.toObject() : bizInfo.socialMedia)
      : bizInfo.socialMedia || {};

    const syncToRestaurant = {
      name: bizInfo.businessName ?? restaurant.name,
      tagline: bizInfo.tagline,
      profile: bizInfo.profile,
      email: bizInfo.email ?? restaurant.email,
      phone: bizInfo.phone,
      whatsapp: bizInfo.whatsapp,
      openingHours: bizInfo.openingHours,
      openingHoursSchedule: bizInfo.openingHoursSchedule,
      logo: bizInfo.logo,
      businessCardFront: bizInfo.businessCardFront,
      businessCardBack: bizInfo.businessCardBack,
      location: locObj,
      socialMedia: socObj
    };

    await Restaurant.findByIdAndUpdate(restaurant._id, { $set: syncToRestaurant }, { runValidators: true });

    const plain = bizInfo.toObject ? bizInfo.toObject() : bizInfo;
    res.json({ success: true, data: plain });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Server error'
    });
  }
});

export default router;
