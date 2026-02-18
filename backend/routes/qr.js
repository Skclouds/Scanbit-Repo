import express from 'express';
import Restaurant from '../models/Restaurant.js';
import { protect } from '../middleware/auth.js';
import { getPublicWebsiteUrl } from '../utils/publicUrl.js';

const router = express.Router();

// @route   GET /api/qr/:restaurantId
// @desc    Get QR code URL for restaurant
// @access  Private
router.get('/:restaurantId', protect, async (req, res) => {
  try {
    const restaurant = await Restaurant.findById(req.params.restaurantId);
    
    if (!restaurant) {
      return res.status(404).json({
        success: false,
        message: 'Restaurant not found'
      });
    }

    const menuUrl = `${getPublicWebsiteUrl()}/menu/${restaurant._id}`;

    res.json({
      success: true,
      data: {
        restaurantId: restaurant._id,
        restaurantName: restaurant.name,
        menuUrl,
        qrCode: menuUrl // In production, generate actual QR code image
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
