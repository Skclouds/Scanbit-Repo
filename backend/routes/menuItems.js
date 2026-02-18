import express from 'express';
import MenuItem from '../models/MenuItem.js';
import Category from '../models/Category.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// @route   GET /api/menu-items
// @desc    Get all menu items for authenticated user's restaurant
// @access  Private
router.get('/', protect, async (req, res) => {
  try {
    const { restaurantId, categoryId, available } = req.query;
    
    // IMPORTANT: Only return items for the user's restaurant
    // This prevents users from seeing other restaurants' data
    const userRestaurantId = req.user.restaurant;
    
    if (!userRestaurantId) {
      return res.status(400).json({
        success: false,
        message: 'User must be associated with a restaurant'
      });
    }
    
    let query = {
      restaurant: userRestaurantId // Always filter by user's restaurant
    };
    
    if (categoryId) {
      query.category = categoryId;
    }
    
    if (available === 'true') {
      query.isAvailable = true;
    }

    const menuItems = await MenuItem.find(query)
      .populate('category', 'name emoji')
      .sort({ order: 1, createdAt: -1 });

    res.json({
      success: true,
      count: menuItems.length,
      data: menuItems
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   GET /api/menu-items/:id
// @desc    Get single menu item
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    const menuItem = await MenuItem.findById(req.params.id)
      .populate('category', 'name emoji')
      .populate('restaurant', 'name');

    if (!menuItem) {
      return res.status(404).json({
        success: false,
        message: 'Menu item not found'
      });
    }

    // Increment views
    menuItem.views += 1;
    await menuItem.save();

    res.json({
      success: true,
      data: menuItem
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   POST /api/menu-items
// @desc    Create a new menu item
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

    // Verify category belongs to restaurant
    const category = await Category.findById(req.body.category);
    if (!category || category.restaurant.toString() !== restaurantId.toString()) {
      return res.status(400).json({
        success: false,
        message: 'Invalid category'
      });
    }

    const menuItem = await MenuItem.create({
      ...req.body,
      restaurant: restaurantId
    });

    res.status(201).json({
      success: true,
      data: menuItem
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   PUT /api/menu-items/:id
// @desc    Update a menu item
// @access  Private
router.put('/:id', protect, async (req, res) => {
  try {
    const menuItem = await MenuItem.findById(req.params.id);
    
    if (!menuItem) {
      return res.status(404).json({
        success: false,
        message: 'Menu item not found'
      });
    }

    // Check if user has access
    if (req.user.role !== 'admin' && menuItem.restaurant.toString() !== req.user.restaurant?.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized'
      });
    }

    const updatedItem = await MenuItem.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    res.json({
      success: true,
      data: updatedItem
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   DELETE /api/menu-items/:id
// @desc    Delete a menu item
// @access  Private
router.delete('/:id', protect, async (req, res) => {
  try {
    const menuItem = await MenuItem.findById(req.params.id);
    
    if (!menuItem) {
      return res.status(404).json({
        success: false,
        message: 'Menu item not found'
      });
    }

    // Check if user has access
    if (req.user.role !== 'admin' && menuItem.restaurant.toString() !== req.user.restaurant?.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized'
      });
    }

    await MenuItem.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: 'Menu item deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

export default router;
