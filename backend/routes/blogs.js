import express from 'express';
import { body, validationResult } from 'express-validator';
import Blog from '../models/Blog.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

// ==================== ADMIN ROUTES (must be before /:slug to avoid conflict) ====================
const adminRouter = express.Router();
adminRouter.use(protect);
adminRouter.use(authorize('admin'));

adminRouter.get('/all', async (req, res) => {
  try {
    const { page = 1, limit = 20, search, isPublished } = req.query;
    const skip = (Math.max(1, parseInt(page)) - 1) * Math.min(100, Math.max(1, parseInt(limit)));

    const query = {};
    if (isPublished === 'true') query.isPublished = true;
    if (isPublished === 'false') query.isPublished = false;
    if (search && search.trim()) {
      query.$or = [
        { title: { $regex: search.trim(), $options: 'i' } },
        { excerpt: { $regex: search.trim(), $options: 'i' } },
        { author: { $regex: search.trim(), $options: 'i' } },
        { category: { $regex: search.trim(), $options: 'i' } },
      ];
    }

    const [blogs, total] = await Promise.all([
      Blog.find(query).sort({ createdAt: -1 }).skip(skip).limit(Math.min(100, Math.max(1, parseInt(limit)))).lean(),
      Blog.countDocuments(query),
    ]);

    res.json({
      success: true,
      data: blogs,
      pagination: {
        page: parseInt(page) || 1,
        limit: parseInt(limit) || 20,
        total,
        totalPages: Math.ceil(total / (parseInt(limit) || 20)),
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch blogs',
    });
  }
});

adminRouter.get('/:id', async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id);
    if (!blog) {
      return res.status(404).json({ success: false, message: 'Blog not found' });
    }
    res.json({ success: true, data: blog });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch blog' });
  }
});

adminRouter.post(
  '/',
  [
    body('title').trim().notEmpty().withMessage('Title is required'),
    body('content').trim().notEmpty().withMessage('Content is required'),
    body('excerpt').optional().trim(),
    body('coverImage').optional().trim(),
    body('author').optional().trim(),
    body('category').optional().trim(),
    body('tags').optional().isArray(),
    body('isPublished').optional().isBoolean(),
    body('metaTitle').optional().trim(),
    body('metaDescription').optional().trim(),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ success: false, errors: errors.array() });
      }

      const { title, content, excerpt, coverImage, author, category, tags, isPublished, metaTitle, metaDescription } = req.body;

      const slug = await Blog.generateSlug(title);

      const blog = await Blog.create({
        title: title.trim(),
        slug,
        content: content.trim(),
        excerpt: (excerpt || '').trim() || content.trim().slice(0, 200),
        coverImage: coverImage || null,
        author: (author || 'ScanBit Team').trim(),
        category: (category || 'General').trim(),
        tags: Array.isArray(tags) ? tags : [],
        isPublished: isPublished !== false,
        metaTitle: (metaTitle || '').trim(),
        metaDescription: (metaDescription || '').trim(),
        createdBy: req.user._id,
        updatedBy: req.user._id,
      });

      res.status(201).json({ success: true, message: 'Blog created successfully', data: blog });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message || 'Failed to create blog' });
    }
  }
);

adminRouter.put(
  '/:id',
  [
    body('title').optional().trim().notEmpty(),
    body('content').optional().trim().notEmpty(),
    body('excerpt').optional().trim(),
    body('coverImage').optional().trim(),
    body('author').optional().trim(),
    body('category').optional().trim(),
    body('tags').optional().isArray(),
    body('isPublished').optional().isBoolean(),
    body('metaTitle').optional().trim(),
    body('metaDescription').optional().trim(),
  ],
  async (req, res) => {
    try {
      const blog = await Blog.findById(req.params.id);
      if (!blog) {
        return res.status(404).json({ success: false, message: 'Blog not found' });
      }

      const { title, content, excerpt, coverImage, author, category, tags, isPublished, metaTitle, metaDescription } = req.body;

      if (title) blog.title = title.trim();
      if (content) blog.content = content.trim();
      if (excerpt !== undefined) blog.excerpt = (excerpt || '').trim();
      if (coverImage !== undefined) blog.coverImage = coverImage || null;
      if (author !== undefined) blog.author = (author || 'ScanBit Team').trim();
      if (category !== undefined) blog.category = (category || 'General').trim();
      if (tags !== undefined) blog.tags = Array.isArray(tags) ? tags : [];
      if (isPublished !== undefined) blog.isPublished = isPublished;
      if (metaTitle !== undefined) blog.metaTitle = (metaTitle || '').trim();
      if (metaDescription !== undefined) blog.metaDescription = (metaDescription || '').trim();

      if (title) {
        const newSlug = slugify(title);
        if (slugify(blog.title) !== newSlug) {
          blog.slug = await Blog.generateSlug(title);
        }
      }
      blog.updatedBy = req.user._id;
      await blog.save();

      res.json({ success: true, message: 'Blog updated successfully', data: blog });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message || 'Failed to update blog' });
    }
  }
);

adminRouter.delete('/:id', async (req, res) => {
  try {
    const blog = await Blog.findByIdAndDelete(req.params.id);
    if (!blog) {
      return res.status(404).json({ success: false, message: 'Blog not found' });
    }
    res.json({ success: true, message: 'Blog deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to delete blog' });
  }
});

function slugify(text) {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^\w\-]+/g, '')
    .replace(/\-\-+/g, '-')
    .replace(/^-+/, '')
    .replace(/-+$/, '');
}

router.use('/admin', adminRouter);

// ==================== PUBLIC ROUTES ====================

// @route   GET /api/blogs
// @desc    Get all published blogs (for website)
// @access  Public
router.get('/', async (req, res) => {
  try {
    const { page = 1, limit = 12, category, search } = req.query;
    const skip = (Math.max(1, parseInt(page)) - 1) * Math.min(50, Math.max(1, parseInt(limit)));

    const query = { isPublished: true };
    if (category && category !== 'all') query.category = category;
    if (search && search.trim()) {
      query.$or = [
        { title: { $regex: search.trim(), $options: 'i' } },
        { excerpt: { $regex: search.trim(), $options: 'i' } },
        { content: { $regex: search.trim(), $options: 'i' } },
      ];
    }

    const [blogs, total] = await Promise.all([
      Blog.find(query)
        .select('title slug excerpt coverImage author category tags publishedAt createdAt')
        .sort({ publishedAt: -1 })
        .skip(skip)
        .limit(Math.min(50, Math.max(1, parseInt(limit))))
        .lean(),
      Blog.countDocuments(query),
    ]);

    res.json({
      success: true,
      data: blogs,
      pagination: {
        page: parseInt(page) || 1,
        limit: parseInt(limit) || 12,
        total,
        totalPages: Math.ceil(total / (parseInt(limit) || 12)),
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch blogs',
    });
  }
});

// @route   GET /api/blogs/:slug
// @desc    Get single blog by slug (for read-more popup)
// @access  Public
router.get('/:slug', async (req, res) => {
  try {
    const blog = await Blog.findOne({
      slug: req.params.slug,
      isPublished: true,
    });

    if (!blog) {
      return res.status(404).json({
        success: false,
        message: 'Blog not found',
      });
    }

    blog.views += 1;
    await blog.save();

    res.json({
      success: true,
      data: blog,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch blog',
    });
  }
});

export default router;
