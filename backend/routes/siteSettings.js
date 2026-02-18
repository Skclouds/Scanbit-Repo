import express from 'express';

import { protect, authorize } from '../middleware/auth.js';
import SiteSettings from '../models/SiteSettings.js';
import { redisExec, redisKey, isRedisConnected } from '../config/redis.js';

const router = express.Router();
const CACHE_TTL = 60; // seconds
async function invalidateSiteSettingsCache() {
  if (isRedisConnected()) {
    await redisExec(async (client) => {
      await client.del(redisKey('site-settings', 'public'));
    });
  }
}

// Public: get current published site settings (Redis cache when available)
router.get('/public', async (req, res) => {
  try {
    res.set('Cache-Control', 'public, max-age=60, stale-while-revalidate=120');
    if (isRedisConnected()) {
      const cached = await redisExec(async (client) => {
        const raw = await client.get(redisKey('site-settings', 'public'));
        return raw ? JSON.parse(raw) : null;
      });
      if (cached) return res.json(cached);
    }
    const settings = await SiteSettings.getSingleton();
    const payload = { success: true, data: settings };
    if (isRedisConnected()) {
      await redisExec(async (client) => {
        await client.setex(redisKey('site-settings', 'public'), CACHE_TTL, JSON.stringify(payload));
      });
    }
    res.json(payload);
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to fetch settings' });
  }
});

// Admin: get settings (including draft)
router.get('/', protect, authorize('admin'), async (req, res) => {
  try {
    const settings = await SiteSettings.getSingleton();
    res.json({ success: true, data: settings });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to fetch settings' });
  }
});

// Admin: update settings (partial update)
router.put('/', protect, authorize('admin'), async (req, res) => {
  try {
    const settings = await SiteSettings.getSingleton();
    const updates = req.body || {};
    Object.assign(settings, updates);
    settings.updatedBy = req.user?._id;
    await settings.save();
    await invalidateSiteSettingsCache();
    res.json({ success: true, data: settings });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to update settings' });
  }
});

// Admin: update general settings
router.put('/general', protect, authorize('admin'), async (req, res) => {
  try {
    // Validation
    const { siteName, tagline, siteDescription, contactEmail, contactPhone, address } = req.body;

    if (!siteName || !siteName.trim()) {
      return res.status(400).json({ 
        success: false, 
        message: 'Site name is required' 
      });
    }

    if (!contactEmail || !contactEmail.trim()) {
      return res.status(400).json({ 
        success: false, 
        message: 'Contact email is required' 
      });
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(contactEmail)) {
      return res.status(400).json({ 
        success: false, 
        message: 'Please provide a valid email address' 
      });
    }

    // Phone validation (optional but if provided, should be valid)
    if (contactPhone && contactPhone.trim()) {
      const phoneRegex = /^[+]?[(]?[0-9]{1,4}[)]?[-\s.]?[(]?[0-9]{1,4}[)]?[-\s.]?[0-9]{1,9}$/;
      if (!phoneRegex.test(contactPhone.trim())) {
        return res.status(400).json({ 
          success: false, 
          message: 'Please provide a valid phone number' 
        });
      }
    }

    const settings = await SiteSettings.getSingleton();
    
    // Update fields - using !== undefined to allow empty strings if needed
    if (siteName !== undefined) {
      settings.general.siteName = siteName.trim();
    }
    if (tagline !== undefined) {
      settings.general.tagline = tagline.trim();
    }
    if (siteDescription !== undefined) {
      settings.general.siteDescription = siteDescription.trim();
    }
    if (contactEmail !== undefined) {
      settings.general.contactEmail = contactEmail.trim().toLowerCase();
    }
    if (contactPhone !== undefined) {
      settings.general.contactPhone = contactPhone.trim();
    }
    if (address !== undefined) {
      settings.general.address = address.trim();
    }
    
    settings.updatedBy = req.user?._id;
    await settings.save();
    
    res.json({ 
      success: true, 
      message: 'General settings updated successfully',
      data: settings 
    });
  } catch (err) {

    res.status(500).json({ 
      success: false, 
      message: err.message || 'Failed to update general settings' 
    });
  }
});

// Admin: update branding
router.put('/branding', protect, authorize('admin'), async (req, res) => {
  try {
    const settings = await SiteSettings.getSingleton();
    if (req.body.logoUrl !== undefined) settings.branding.logoUrl = req.body.logoUrl;
    if (req.body.darkLogoUrl !== undefined) settings.branding.darkLogoUrl = req.body.darkLogoUrl;
    if (req.body.mobileLogoUrl !== undefined) settings.branding.mobileLogoUrl = req.body.mobileLogoUrl;
    if (req.body.footerLogoUrl !== undefined) settings.branding.footerLogoUrl = req.body.footerLogoUrl;
    if (req.body.faviconUrl !== undefined) settings.branding.faviconUrl = req.body.faviconUrl;
    if (req.body.appIconUrl !== undefined) settings.branding.appIconUrl = req.body.appIconUrl;
    settings.updatedBy = req.user?._id;
    await settings.save();
    res.json({ success: true, data: settings });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to update branding' });
  }
});

// Admin: update typography
router.put('/typography', protect, authorize('admin'), async (req, res) => {
  try {
    const settings = await SiteSettings.getSingleton();
    if (req.body.fontFamily) settings.typography.fontFamily = req.body.fontFamily;
    if (req.body.baseFontSize) settings.typography.baseFontSize = req.body.baseFontSize;
    settings.updatedBy = req.user?._id;
    await settings.save();
    res.json({ success: true, data: settings });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to update typography' });
  }
});

// Admin: update colors
router.put('/colors', protect, authorize('admin'), async (req, res) => {
  try {
    const settings = await SiteSettings.getSingleton();
    if (req.body.primary) settings.colors.primary = req.body.primary;
    if (req.body.secondary) settings.colors.secondary = req.body.secondary;
    if (req.body.background) settings.colors.background = req.body.background;
    if (req.body.text) settings.colors.text = req.body.text;
    settings.updatedBy = req.user?._id;
    await settings.save();
    res.json({ success: true, data: settings });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to update colors' });
  }
});

// Admin: update layout
router.put('/layout', protect, authorize('admin'), async (req, res) => {
  try {
    const settings = await SiteSettings.getSingleton();
    if (req.body.contentWidth) settings.layout.contentWidth = req.body.contentWidth;
    if (req.body.headerStyle) settings.layout.headerStyle = req.body.headerStyle;
    if (req.body.footerStyle) settings.layout.footerStyle = req.body.footerStyle;
    settings.updatedBy = req.user?._id;
    await settings.save();
    res.json({ success: true, data: settings });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to update layout' });
  }
});

// Admin: update media
router.put('/media', protect, authorize('admin'), async (req, res) => {
  try {
    const settings = await SiteSettings.getSingleton();
    if (req.body.heroImageUrl !== undefined) settings.media.heroImageUrl = req.body.heroImageUrl;
    if (req.body.bannerImageUrl !== undefined) settings.media.bannerImageUrl = req.body.bannerImageUrl;
    settings.updatedBy = req.user?._id;
    await settings.save();
    res.json({ success: true, data: settings });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to update media' });
  }
});

// Admin: update animations
router.put('/animations', protect, authorize('admin'), async (req, res) => {
  try {
    const settings = await SiteSettings.getSingleton();
    if (req.body.enabled !== undefined) settings.animations.enabled = req.body.enabled;
    if (req.body.durationMs) settings.animations.durationMs = req.body.durationMs;
    settings.updatedBy = req.user?._id;
    await settings.save();
    res.json({ success: true, data: settings });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to update animations' });
  }
});

// Admin: update sections
router.put('/sections', protect, authorize('admin'), async (req, res) => {
  try {
    const settings = await SiteSettings.getSingleton();
    if (req.body.showFeatures !== undefined) settings.sections.showFeatures = req.body.showFeatures;
    if (req.body.showPricing !== undefined) settings.sections.showPricing = req.body.showPricing;
    if (req.body.showTestimonials !== undefined) settings.sections.showTestimonials = req.body.showTestimonials;
    if (req.body.showFAQ !== undefined) settings.sections.showFAQ = req.body.showFAQ;
    settings.updatedBy = req.user?._id;
    await settings.save();
    res.json({ success: true, data: settings });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to update sections' });
  }
});

// Admin: update SEO (all fields optional)
router.put('/seo', protect, authorize('admin'), async (req, res) => {
  try {
    const settings = await SiteSettings.getSingleton();
    const body = req.body || {};
    const seoFields = [
      'metaTitle', 'metaDescription', 'metaKeywords', 'canonicalUrl', 'author', 'themeColor', 'locale',
      'ogTitle', 'ogDescription', 'ogImage', 'ogImageWidth', 'ogImageHeight', 'ogType', 'ogSiteName', 'ogLocale', 'ogUrl',
      'twitterCard', 'twitterTitle', 'twitterDescription', 'twitterImage', 'twitterSite', 'twitterCreator',
      'robotsIndex', 'robotsFollow', 'robotsExtra',
      'googleAnalyticsId', 'googleTagManagerId', 'googleSiteVerification', 'bingSiteVerification',
      'jsonLdOrganization', 'jsonLdWebSite', 'jsonLdBreadcrumb',
    ];
    seoFields.forEach((key) => {
      if (body[key] !== undefined) {
        if (key === 'ogImageWidth' || key === 'ogImageHeight') {
          const n = parseInt(body[key], 10);
          if (!Number.isNaN(n)) settings.seo[key] = n;
        } else if (Array.isArray(body[key]) && key === 'metaKeywords') {
          settings.seo[key] = body[key].filter((v) => typeof v === 'string').slice(0, 30);
        } else if (typeof body[key] === 'string') {
          settings.seo[key] = body[key].trim();
        }
      }
    });
    if (Array.isArray(body.extraMetaTags)) {
      settings.seo.extraMetaTags = body.extraMetaTags
        .filter((t) => t && typeof t.content === 'string' && (t.name || t.property))
        .slice(0, 20)
        .map((t) => ({ name: t.name || '', property: t.property || '', content: String(t.content).trim() }));
    }
    settings.updatedBy = req.user?._id;
    await settings.save();
    res.json({ success: true, data: settings });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to update SEO' });
  }
});

// Admin: publish current draft
router.post('/publish', protect, authorize('admin'), async (req, res) => {
  try {
    const settings = await SiteSettings.getSingleton();
    settings.publish.isDraft = false;
    settings.publish.publishedAt = new Date();
    await settings.save();
    await invalidateSiteSettingsCache();
    res.json({ success: true, data: settings });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to publish settings' });
  }
});

// Admin: preview (mark as draft)
router.post('/preview', protect, authorize('admin'), async (req, res) => {
  try {
    const settings = await SiteSettings.getSingleton();
    settings.publish.isDraft = true;
    await settings.save();
    await invalidateSiteSettingsCache();
    res.json({ success: true, data: settings });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to create preview' });
  }
});

export default router;
