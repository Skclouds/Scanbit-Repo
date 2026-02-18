import express from 'express';
import Category from '../models/Category.js';
import MenuItem from '../models/MenuItem.js';
import { protect, checkRestaurantAccess } from '../middleware/auth.js';

const router = express.Router();

// @route   GET /api/categories
// @desc    Get all categories for user's restaurant
// @access  Private
router.get('/', protect, async (req, res) => {
  try {
    // IMPORTANT: Only return categories for the user's own restaurant
    // Do NOT allow querying other restaurants' categories
    const restaurantId = req.user.restaurant;
    
    if (!restaurantId) {
      return res.status(400).json({
        success: false,
        message: 'User must be associated with a restaurant'
      });
    }

    const categories = await Category.find({ 
      restaurant: restaurantId,
      isActive: true 
    }).sort({ order: 1 });

    // Get item count for each category
    const categoriesWithCount = await Promise.all(
      categories.map(async (category) => {
        const itemCount = await MenuItem.countDocuments({
          category: category._id,
          isAvailable: true
        });
        return {
          ...category.toObject(),
          itemCount
        };
      })
    );

    res.json({
      success: true,
      count: categoriesWithCount.length,
      data: categoriesWithCount
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   POST /api/categories
// @desc    Create a new category
// @access  Private
router.post('/', protect, async (req, res) => {
  try {
    const restaurantId = req.user.restaurant;
    
    if (!restaurantId) {
      return res.status(400).json({
        success: false,
        message: 'User must be associated with a restaurant'
      });
    }

    const category = await Category.create({
      ...req.body,
      restaurant: restaurantId
    });

    res.status(201).json({
      success: true,
      data: category
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   PUT /api/categories/:id
// @desc    Update a category
// @access  Private
router.put('/:id', protect, async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);
    
    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'Category not found'
      });
    }

    // Check if user has access
    if (req.user.role !== 'admin' && category.restaurant.toString() !== req.user.restaurant?.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized'
      });
    }

    const updatedCategory = await Category.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    res.json({
      success: true,
      data: updatedCategory
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   DELETE /api/categories/:id
// @desc    Delete a category
// @access  Private
router.delete('/:id', protect, async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);
    
    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'Category not found'
      });
    }

    // Check if user has access
    if (req.user.role !== 'admin' && category.restaurant.toString() !== req.user.restaurant?.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized'
      });
    }

    // Delete all menu items in this category
    await MenuItem.deleteMany({ category: category._id });
    
    // Delete category
    await Category.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: 'Category deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

export default router;
