import express from 'express';
import BusinessCategory from '../models/BusinessCategory.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

// @route   GET /api/business-categories
// @desc    Get all business categories (public)
// @access  Public
router.get('/', async (req, res) => {
  try {
    const categories = await BusinessCategory.find({ isActive: true })
      .sort({ order: 1, name: 1 });

    res.json({
      success: true,
      count: categories.length,
      data: categories
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   GET /api/business-categories/:id
// @desc    Get single business category
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    const category = await BusinessCategory.findById(req.params.id);
    
    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'Business category not found'
      });
    }

    res.json({
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

// @route   POST /api/business-categories
// @desc    Create business category (admin only)
// @access  Private/Admin
router.post('/', protect, authorize('admin', 'masteradmin'), async (req, res) => {
  try {
    const category = await BusinessCategory.create(req.body);

    res.status(201).json({
      success: true,
      data: category
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'Business category with this name already exists'
      });
    }
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   PUT /api/business-categories/:id
// @desc    Update business category (admin only)
// @access  Private/Admin
router.put('/:id', protect, authorize('admin', 'masteradmin'), async (req, res) => {
  try {
    const category = await BusinessCategory.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'Business category not found'
      });
    }

    res.json({
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

// @route   DELETE /api/business-categories/:id
// @desc    Delete business category (admin only)
// @access  Private/Admin
router.delete('/:id', protect, authorize('admin', 'masteradmin'), async (req, res) => {
  try {
    const category = await BusinessCategory.findByIdAndDelete(req.params.id);

    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'Business category not found'
      });
    }

    res.json({
      success: true,
      message: 'Business category deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   POST /api/business-categories/:id/business-types
// @desc    Add business type to category (admin only)
// @access  Private/Admin
router.post('/:id/business-types', protect, authorize('admin', 'masteradmin'), async (req, res) => {
  try {
    const category = await BusinessCategory.findById(req.params.id);

    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'Business category not found'
      });
    }

    category.businessTypes.push(req.body);
    await category.save();

    res.json({
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

// @route   PUT /api/business-categories/:categoryId/business-types/:typeId
// @desc    Update business type (admin only)
// @access  Private/Admin
router.put('/:categoryId/business-types/:typeId', protect, authorize('admin', 'masteradmin'), async (req, res) => {
  try {
    const category = await BusinessCategory.findById(req.params.categoryId);

    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'Business category not found'
      });
    }

    const businessType = category.businessTypes.id(req.params.typeId);
    if (!businessType) {
      return res.status(404).json({
        success: false,
        message: 'Business type not found'
      });
    }

    Object.assign(businessType, req.body);
    await category.save();

    res.json({
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

// @route   DELETE /api/business-categories/:categoryId/business-types/:typeId
// @desc    Delete business type (admin only)
// @access  Private/Admin
router.delete('/:categoryId/business-types/:typeId', protect, authorize('admin', 'masteradmin'), async (req, res) => {
  try {
    const category = await BusinessCategory.findById(req.params.categoryId);

    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'Business category not found'
      });
    }

    category.businessTypes.id(req.params.typeId)?.remove();
    await category.save();

    res.json({
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

export default router;
