import express from 'express';
import Review from '../models/Review.js';
import Restaurant from '../models/Restaurant.js';
import User from '../models/User.js';
import { protect } from '../middleware/auth.js';
import { getReviewReceivedEmailTemplate } from '../utils/emailTemplates.js';
import { sendEmail } from '../utils/emailService.js';
import getPublicWebsiteUrl from '../utils/publicUrl.js';

const router = express.Router();

// --- RESTAURANT REVIEWS ROUTES ---

// @route   GET /api/restaurants/my-restaurant/reviews
// @desc    Get all reviews for the current user's restaurant
// @access  Private
router.get('/my-restaurant/reviews', protect, async (req, res) => {
  try {
    const restaurantId = req.user.restaurant;
    if (!restaurantId) {
      return res.status(400).json({
        success: false,
        message: 'User must be associated with a restaurant'
      });
    }

    const reviews = await Review.find({ restaurant: restaurantId })
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      data: reviews
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   GET /api/restaurants/:restaurantId/reviews
// @desc    Get all reviews for a restaurant (public for portfolio/menu reviews page)
// @access  Public
router.get('/:restaurantId/reviews', async (req, res) => {
  try {
    const reviews = await Review.find({
      restaurant: req.params.restaurantId,
      status: { $in: ['published', undefined] }
    }).sort({ createdAt: -1 });

    res.json({
      success: true,
      data: reviews
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   POST /api/restaurants/:restaurantId/reviews
// @desc    Submit a review (name, email, mobile, message, rating) — portfolio & menu
// @access  Public
router.post('/:restaurantId/reviews', async (req, res) => {
  try {
    const { rating, comment, message, reviewerName, reviewerEmail, reviewerMobile } = req.body;
    const { restaurantId } = req.params;
    const commentText = (comment || message || '').trim();

    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a rating between 1 and 5'
      });
    }
    if (!(reviewerName && String(reviewerName).trim())) {
      return res.status(400).json({
        success: false,
        message: 'Name is required'
      });
    }
    if (!(reviewerEmail && String(reviewerEmail).trim())) {
      return res.status(400).json({
        success: false,
        message: 'Email is required'
      });
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(String(reviewerEmail).toLowerCase())) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid email address'
      });
    }

    const restaurant = await Restaurant.findById(restaurantId);
    if (!restaurant) {
      return res.status(404).json({
        success: false,
        message: 'Restaurant not found'
      });
    }

    const review = await Review.create({
      restaurant: restaurantId,
      rating: Math.min(5, Math.max(1, Number(rating))),
      comment: commentText,
      reviewerName: String(reviewerName).trim(),
      reviewerEmail: String(reviewerEmail).toLowerCase().trim(),
      reviewerMobile: reviewerMobile ? String(reviewerMobile).trim() : null
    });

    const owner = await User.findById(restaurant.owner).select('name email').lean();
    if (owner?.email) {
      const baseUrl = getPublicWebsiteUrl();
      const category = (restaurant.businessCategory || restaurant.businessType || '').toLowerCase();
      const isPortfolio = /portfolio|professional|creative|design|agency|consult|legal|service/.test(category);
      const reviewsUrl = isPortfolio ? `${baseUrl}/menu/${restaurantId}/reviews` : `${baseUrl}/menu/${restaurantId}/reviews`;
      const html = getReviewReceivedEmailTemplate(owner.name, restaurant.name, review.reviewerName, review.rating, review.comment, reviewsUrl);
      sendEmail(owner.email, 'New customer review — ScanBit', html).catch(() => {});
    }

    // Update restaurant rating stats
    const reviews = await Review.find({ restaurant: restaurantId, status: 'published' });
    const totalReviews = reviews.length;
    const averageRating = totalReviews > 0 
      ? reviews.reduce((sum, r) => sum + r.rating, 0) / totalReviews 
      : 0;

    restaurant.rating = Math.round(averageRating * 10) / 10;
    restaurant.totalReviews = totalReviews;
    await restaurant.save();

    res.status(201).json({
      success: true,
      data: review,
      message: 'Review submitted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// --- INDIVIDUAL REVIEW ROUTES ---

// @route   PUT /api/reviews/:reviewId/status
// @desc    Update review status
// @access  Private
router.put('/:reviewId/status', protect, async (req, res) => {
  try {
    const { status } = req.body;

    if (!['published', 'hidden'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status'
      });
    }

    const review = await Review.findById(req.params.reviewId);
    if (!review) {
      return res.status(404).json({
        success: false,
        message: 'Review not found'
      });
    }

    review.status = status;
    await review.save();

    // Recalculate restaurant stats
    const restaurant = await Restaurant.findById(review.restaurant);
    if (restaurant) {
      const reviews = await Review.find({ restaurant: review.restaurant, status: 'published' });
      const totalReviews = reviews.length;
      const averageRating = totalReviews > 0 
        ? reviews.reduce((sum, r) => sum + r.rating, 0) / totalReviews 
        : 0;

      restaurant.rating = Math.round(averageRating * 10) / 10;
      restaurant.totalReviews = totalReviews;
      await restaurant.save();
    }

    res.json({
      success: true,
      message: `Review ${status} successfully`
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

export default router;
