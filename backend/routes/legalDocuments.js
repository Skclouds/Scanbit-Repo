import express from 'express';
import { body, validationResult } from 'express-validator';
import LegalDocument from '../models/LegalDocument.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

// ==================== PUBLIC ROUTES ====================

// @route   GET /api/legal-documents
// @desc    Get all active legal documents
// @access  Public
router.get('/', async (req, res) => {
  try {
    const { type, language = 'en', slug } = req.query;
    const query = { isActive: true };

    if (type) {
      query.type = type;
    }
    if (language) {
      query.language = language;
    }
    if (slug) {
      query.slug = slug;
    }

    const documents = await LegalDocument.find(query)
      .select('-content') // Don't send full content in list
      .sort({ isDefault: -1, createdAt: -1 });

    res.json({
      success: true,
      data: documents
    });
  } catch (error) {

    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   GET /api/legal-documents/:slug
// @desc    Get single legal document by slug
// @access  Public
router.get('/:slug', async (req, res) => {
  try {
    const document = await LegalDocument.findOne({ 
      slug: req.params.slug,
      isActive: true 
    });

    if (!document) {
      return res.status(404).json({
        success: false,
        message: 'Document not found'
      });
    }

    // Increment views
    document.views += 1;
    await document.save();

    res.json({
      success: true,
      data: document
    });
  } catch (error) {

    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   GET /api/legal-documents/type/:type
// @desc    Get default document by type
// @access  Public
router.get('/type/:type', async (req, res) => {
  try {
    const document = await LegalDocument.findOne({
      type: req.params.type,
      isActive: true,
      isDefault: true
    });

    if (!document) {
      // Fallback to most recent if no default
      const fallback = await LegalDocument.findOne({
        type: req.params.type,
        isActive: true
      }).sort({ createdAt: -1 });

      if (!fallback) {
        return res.status(404).json({
          success: false,
          message: 'Document not found'
        });
      }

      return res.json({
        success: true,
        data: fallback
      });
    }

    // Increment views
    document.views += 1;
    await document.save();

    res.json({
      success: true,
      data: document
    });
  } catch (error) {

    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// ==================== ADMIN ROUTES ====================

// @route   GET /api/legal-documents/admin/all
// @desc    Get all legal documents (admin)
// @access  Private/Admin
router.get('/admin/all', protect, authorize('admin'), async (req, res) => {
  try {
    const { type, language, page = 1, limit = 20, search } = req.query;
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    const query = {};

    if (type && type !== 'all') {
      query.type = type;
    }
    if (language && language !== 'all') {
      query.language = language;
    }
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { slug: { $regex: search, $options: 'i' } },
        { shortDescription: { $regex: search, $options: 'i' } }
      ];
    }

    const documents = await LegalDocument.find(query)
      .populate('createdBy', 'name email')
      .populate('updatedBy', 'name email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum);

    const total = await LegalDocument.countDocuments(query);

    res.json({
      success: true,
      data: documents,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        pages: Math.ceil(total / limitNum)
      }
    });
  } catch (error) {

    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   GET /api/legal-documents/admin/:id
// @desc    Get single legal document (admin)
// @access  Private/Admin
router.get('/admin/:id', protect, authorize('admin'), async (req, res) => {
  try {
    const document = await LegalDocument.findById(req.params.id)
      .populate('createdBy', 'name email')
      .populate('updatedBy', 'name email');

    if (!document) {
      return res.status(404).json({
        success: false,
        message: 'Document not found'
      });
    }

    res.json({
      success: true,
      data: document
    });
  } catch (error) {

    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   POST /api/legal-documents/admin
// @desc    Create legal document (admin)
// @access  Private/Admin
router.post('/admin', protect, authorize('admin'), [
  body('title').trim().notEmpty().withMessage('Title is required'),
  body('content').trim().notEmpty().withMessage('Content is required'),
  body('type').isIn(['privacy-policy', 'terms-conditions', 'cookie-policy', 'refund-policy', 'shipping-policy', 'user-agreement', 'other']).withMessage('Invalid document type')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: errors.array()
      });
    }

    const {
      title,
      type,
      content,
      shortDescription,
      version,
      effectiveDate,
      isActive,
      isDefault,
      language,
      requiresAcceptance,
      acceptanceRequiredFor
    } = req.body;

    const document = new LegalDocument({
      title,
      slug: title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''),
      type: type || 'privacy-policy',
      content,
      shortDescription: shortDescription || '',
      version: version || '1.0',
      effectiveDate: effectiveDate ? new Date(effectiveDate) : new Date(),
      isActive: isActive !== undefined ? isActive : true,
      isDefault: isDefault || false,
      language: language || 'en',
      requiresAcceptance: requiresAcceptance || false,
      acceptanceRequiredFor: acceptanceRequiredFor || [],
      createdBy: req.user.id
    });

    await document.save();

    const populatedDocument = await LegalDocument.findById(document._id)
      .populate('createdBy', 'name email');

    res.status(201).json({
      success: true,
      message: 'Legal document created successfully',
      data: populatedDocument
    });
  } catch (error) {

    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'A document with this slug already exists'
      });
    }
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   PUT /api/legal-documents/admin/:id
// @desc    Update legal document (admin)
// @access  Private/Admin
router.put('/admin/:id', protect, authorize('admin'), async (req, res) => {
  try {
    const document = await LegalDocument.findById(req.params.id);
    if (!document) {
      return res.status(404).json({
        success: false,
        message: 'Document not found'
      });
    }

    const {
      title,
      type,
      content,
      shortDescription,
      version,
      effectiveDate,
      isActive,
      isDefault,
      language,
      requiresAcceptance,
      acceptanceRequiredFor
    } = req.body;

    if (title) {
      document.title = title;
      if (!document.slug || document.slug === document.title.toLowerCase().replace(/[^a-z0-9]+/g, '-')) {
        document.slug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
      }
    }
    if (type) document.type = type;
    if (content) document.content = content;
    if (shortDescription !== undefined) document.shortDescription = shortDescription;
    if (version) document.version = version;
    if (effectiveDate) document.effectiveDate = new Date(effectiveDate);
    if (isActive !== undefined) document.isActive = isActive;
    if (isDefault !== undefined) document.isDefault = isDefault;
    if (language) document.language = language;
    if (requiresAcceptance !== undefined) document.requiresAcceptance = requiresAcceptance;
    if (acceptanceRequiredFor) document.acceptanceRequiredFor = acceptanceRequiredFor;
    document.updatedBy = req.user.id;
    document.lastUpdated = new Date();

    await document.save();

    const updatedDocument = await LegalDocument.findById(document._id)
      .populate('createdBy', 'name email')
      .populate('updatedBy', 'name email');

    res.json({
      success: true,
      message: 'Legal document updated successfully',
      data: updatedDocument
    });
  } catch (error) {

    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'A document with this slug already exists'
      });
    }
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   DELETE /api/legal-documents/admin/:id
// @desc    Delete legal document (admin)
// @access  Private/Admin
router.delete('/admin/:id', protect, authorize('admin'), async (req, res) => {
  try {
    const document = await LegalDocument.findById(req.params.id);
    if (!document) {
      return res.status(404).json({
        success: false,
        message: 'Document not found'
      });
    }

    if (document.isDefault) {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete default document. Set another as default first.'
      });
    }

    await LegalDocument.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: 'Legal document deleted successfully'
    });
  } catch (error) {

    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

export default router;
