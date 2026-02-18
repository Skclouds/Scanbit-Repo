import express from 'express';
import { body, validationResult } from 'express-validator';
import bcrypt from 'bcryptjs';
import SupportTicket from '../models/SupportTicket.js';
import FAQ from '../models/FAQ.js';
import KnowledgeBase from '../models/KnowledgeBase.js';
import User from '../models/User.js';
import Restaurant from '../models/Restaurant.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

// ==================== SUPPORT TICKETS ====================

// @route   GET /api/support/tickets
// @desc    Get all support tickets (admin) or user's tickets
// @access  Private
router.get('/tickets', protect, async (req, res) => {
  try {
    const { status, priority, category, assignedTo, page = 1, limit = 20, search } = req.query;
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    // Build query
    const query = {};
    
    // If not admin, only show user's tickets
    if (req.user.role !== 'admin') {
      query.user = req.user.id;
    }

    if (status && status !== 'all') {
      query.status = status;
    }
    if (priority && priority !== 'all') {
      query.priority = priority;
    }
    if (category && category !== 'all') {
      query.category = category;
    }
    if (assignedTo && assignedTo !== 'all') {
      query.assignedTo = assignedTo;
    }
    if (search) {
      query.$or = [
        { subject: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { ticketNumber: { $regex: search, $options: 'i' } }
      ];
    }

    const tickets = await SupportTicket.find(query)
      .populate('user', 'name email')
      .populate('restaurant', 'businessName email')
      .populate('assignedTo', 'name email')
      .populate('resolvedBy', 'name email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum);

    const total = await SupportTicket.countDocuments(query);

    res.json({
      success: true,
      data: tickets,
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

// @route   GET /api/support/tickets/:id
// @desc    Get single ticket
// @access  Private
router.get('/tickets/:id', protect, async (req, res) => {
  try {
    const ticket = await SupportTicket.findById(req.params.id)
      .populate('user', 'name email')
      .populate('restaurant', 'businessName email')
      .populate('assignedTo', 'name email')
      .populate('resolvedBy', 'name email')
      .populate('messages.user', 'name email role');

    if (!ticket) {
      return res.status(404).json({
        success: false,
        message: 'Ticket not found'
      });
    }

    // Check if user has access
    if (req.user.role !== 'admin' && ticket.user._id.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    res.json({
      success: true,
      data: ticket
    });
  } catch (error) {

    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   POST /api/support/tickets/public
// @desc    Create new support ticket from public chat widget (no auth required)
// @access  Public
router.post('/tickets/public', [
  body('subject').trim().notEmpty().withMessage('Subject is required'),
  body('description').trim().notEmpty().withMessage('Description is required'),
  body('userEmail').isEmail().withMessage('Valid email is required'),
  body('userPhone').trim().notEmpty().withMessage('Phone number is required'),
  body('userQuery').trim().notEmpty().withMessage('Query is required'),
  body('category').optional().isIn(['technical', 'billing', 'account', 'feature-request', 'bug-report', 'general', 'subscription', 'other']).withMessage('Invalid category'),
  body('priority').optional().isIn(['low', 'medium', 'high', 'urgent']).withMessage('Invalid priority')
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

    const { subject, description, category, priority, userEmail, userPhone, userQuery, selectedQuestion, selectedAnswer } = req.body;

    // Try to find user by email
    let user = await User.findOne({ email: userEmail });
    if (!user) {
      // For public tickets, we'll create a minimal user record or use a system user
      // Since User model requires password, we'll use a temporary password
      const tempPassword = `temp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      const hashedPassword = await bcrypt.hash(tempPassword, 10);
      
      user = new User({
        name: userEmail.split('@')[0] || 'Guest User',
        email: userEmail,
        phone: userPhone,
        password: hashedPassword,
        role: 'user',
        isActive: true,
      });
      await user.save();
    } else {
      // Update phone if provided and different
      if (userPhone && user.phone !== userPhone) {
        user.phone = userPhone;
        await user.save();
      }
    }

    const ticket = new SupportTicket({
      user: user._id,
      restaurant: user.restaurant || null,
      subject: subject || `Support Query from ${userEmail}`,
      description: `Query from Public Support Chat:\n\n${description}\n\nSelected Question: ${selectedQuestion || 'N/A'}\nSelected Answer: ${selectedAnswer || 'N/A'}\n\nUser Query: ${userQuery}\n\nContact Details:\nEmail: ${userEmail}\nPhone: ${userPhone}`,
      category: category || 'general',
      priority: priority || 'medium',
      status: 'open',
      messages: [{
        user: user._id,
        message: `User Query: ${userQuery}\n\nContact: ${userEmail} | ${userPhone}`,
        isInternal: false,
        createdAt: new Date()
      }],
      tags: ['public-chat', 'website-widget']
    });

    await ticket.save();

    const populatedTicket = await SupportTicket.findById(ticket._id)
      .populate('user', 'name email phone')
      .populate('restaurant', 'businessName email');

    res.status(201).json({
      success: true,
      message: 'Ticket created successfully. We will get back to you within 24-48 hours.',
      data: populatedTicket
    });
  } catch (error) {

    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   POST /api/support/tickets
// @desc    Create new support ticket
// @access  Private
router.post('/tickets', protect, [
  body('subject').trim().notEmpty().withMessage('Subject is required'),
  body('description').trim().notEmpty().withMessage('Description is required'),
  body('category').isIn(['technical', 'billing', 'account', 'feature-request', 'bug-report', 'general', 'subscription', 'other']).withMessage('Invalid category'),
  body('priority').optional().isIn(['low', 'medium', 'high', 'urgent']).withMessage('Invalid priority')
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

    const { subject, description, category, priority, tags } = req.body;

    const ticket = new SupportTicket({
      user: req.user.id,
      restaurant: req.user.restaurant || null,
      subject,
      description,
      category: category || 'general',
      priority: priority || 'medium',
      tags: tags || [],
      messages: [{
        user: req.user.id,
        message: description,
        isInternal: false,
        createdAt: new Date()
      }]
    });

    await ticket.save();

    const populatedTicket = await SupportTicket.findById(ticket._id)
      .populate('user', 'name email')
      .populate('restaurant', 'businessName email');

    res.status(201).json({
      success: true,
      message: 'Ticket created successfully',
      data: populatedTicket
    });
  } catch (error) {

    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   PUT /api/support/tickets/:id
// @desc    Update ticket
// @access  Private/Admin
router.put('/tickets/:id', protect, [
  body('status').optional().isIn(['open', 'in-progress', 'resolved', 'closed', 'pending']).withMessage('Invalid status'),
  body('priority').optional().isIn(['low', 'medium', 'high', 'urgent']).withMessage('Invalid priority'),
  body('assignedTo').optional().isMongoId().withMessage('Invalid assignedTo ID')
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

    const ticket = await SupportTicket.findById(req.params.id);
    if (!ticket) {
      return res.status(404).json({
        success: false,
        message: 'Ticket not found'
      });
    }

    // Check access
    if (req.user.role !== 'admin' && ticket.user.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    const { subject, description, status, priority, category, assignedTo, tags, resolution } = req.body;

    if (subject) ticket.subject = subject;
    if (description) ticket.description = description;
    if (status) {
      ticket.status = status;
      if (status === 'resolved' || status === 'closed') {
        ticket.resolvedAt = new Date();
        ticket.resolvedBy = req.user.id;
      }
    }
    if (priority) ticket.priority = priority;
    if (category) ticket.category = category;
    if (assignedTo !== undefined) ticket.assignedTo = assignedTo || null;
    if (tags) ticket.tags = tags;
    if (resolution) ticket.resolution = resolution;

    await ticket.save();

    const updatedTicket = await SupportTicket.findById(ticket._id)
      .populate('user', 'name email')
      .populate('restaurant', 'businessName email')
      .populate('assignedTo', 'name email')
      .populate('resolvedBy', 'name email');

    res.json({
      success: true,
      message: 'Ticket updated successfully',
      data: updatedTicket
    });
  } catch (error) {

    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   POST /api/support/tickets/:id/messages
// @desc    Add message to ticket
// @access  Private
router.post('/tickets/:id/messages', protect, [
  body('message').trim().notEmpty().withMessage('Message is required')
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

    const ticket = await SupportTicket.findById(req.params.id);
    if (!ticket) {
      return res.status(404).json({
        success: false,
        message: 'Ticket not found'
      });
    }

    // Check access
    if (req.user.role !== 'admin' && ticket.user.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    const { message, isInternal = false, attachments = [] } = req.body;

    await ticket.addMessage(req.user.id, message, req.user.role === 'admin' ? isInternal : false, attachments);

    const updatedTicket = await SupportTicket.findById(ticket._id)
      .populate('user', 'name email')
      .populate('restaurant', 'businessName email')
      .populate('assignedTo', 'name email')
      .populate('messages.user', 'name email role');

    res.json({
      success: true,
      message: 'Message added successfully',
      data: updatedTicket
    });
  } catch (error) {

    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   DELETE /api/support/tickets/:id
// @desc    Delete support ticket
// @access  Private/Admin
router.delete('/tickets/:id', protect, authorize('admin'), async (req, res) => {
  try {
    const ticket = await SupportTicket.findById(req.params.id);
    if (!ticket) {
      return res.status(404).json({
        success: false,
        message: 'Ticket not found'
      });
    }

    await SupportTicket.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: 'Ticket deleted successfully'
    });
  } catch (error) {

    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   POST /api/support/tickets/:id/rating
// @desc    Submit satisfaction rating
// @access  Private
router.post('/tickets/:id/rating', protect, [
  body('rating').isInt({ min: 1, max: 5 }).withMessage('Rating must be between 1 and 5'),
  body('feedback').optional().trim()
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

    const ticket = await SupportTicket.findById(req.params.id);
    if (!ticket) {
      return res.status(404).json({
        success: false,
        message: 'Ticket not found'
      });
    }

    // Only ticket owner can rate
    if (ticket.user.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    ticket.satisfactionRating = req.body.rating;
    ticket.satisfactionFeedback = req.body.feedback || null;
    await ticket.save();

    res.json({
      success: true,
      message: 'Rating submitted successfully'
    });
  } catch (error) {

    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   GET /api/support/tickets/stats/overview
// @desc    Get ticket statistics (admin only)
// @access  Private/Admin
router.get('/tickets/stats/overview', protect, authorize('admin'), async (req, res) => {
  try {
    const { dateRange = '30' } = req.query;
    const days = parseInt(dateRange);
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const totalTickets = await SupportTicket.countDocuments({
      createdAt: { $gte: startDate }
    });

    const openTickets = await SupportTicket.countDocuments({
      status: 'open',
      createdAt: { $gte: startDate }
    });

    const inProgressTickets = await SupportTicket.countDocuments({
      status: 'in-progress',
      createdAt: { $gte: startDate }
    });

    const resolvedTickets = await SupportTicket.countDocuments({
      status: 'resolved',
      createdAt: { $gte: startDate }
    });

    const closedTickets = await SupportTicket.countDocuments({
      status: 'closed',
      createdAt: { $gte: startDate }
    });

    const urgentTickets = await SupportTicket.countDocuments({
      priority: 'urgent',
      status: { $in: ['open', 'in-progress'] },
      createdAt: { $gte: startDate }
    });

    // Average response time
    const ticketsWithResponse = await SupportTicket.find({
      firstResponseAt: { $exists: true, $ne: null },
      createdAt: { $gte: startDate }
    });

    const avgResponseTime = ticketsWithResponse.length > 0
      ? ticketsWithResponse.reduce((sum, ticket) => {
          const responseTime = (ticket.firstResponseAt - ticket.createdAt) / (1000 * 60); // minutes
          return sum + responseTime;
        }, 0) / ticketsWithResponse.length
      : 0;

    // Average resolution time
    const resolvedTicketsList = await SupportTicket.find({
      resolvedAt: { $exists: true, $ne: null },
      createdAt: { $gte: startDate }
    });

    const avgResolutionTime = resolvedTicketsList.length > 0
      ? resolvedTicketsList.reduce((sum, ticket) => {
          const resolutionTime = (ticket.resolvedAt - ticket.createdAt) / (1000 * 60 * 60); // hours
          return sum + resolutionTime;
        }, 0) / resolvedTicketsList.length
      : 0;

    // Tickets by category
    const ticketsByCategory = await SupportTicket.aggregate([
      { $match: { createdAt: { $gte: startDate } } },
      { $group: { _id: '$category', count: { $sum: 1 } } }
    ]);

    // Tickets by status
    const ticketsByStatus = await SupportTicket.aggregate([
      { $match: { createdAt: { $gte: startDate } } },
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ]);

    // Satisfaction rating
    const ratedTickets = await SupportTicket.find({
      satisfactionRating: { $exists: true, $ne: null },
      createdAt: { $gte: startDate }
    });

    const avgSatisfaction = ratedTickets.length > 0
      ? ratedTickets.reduce((sum, ticket) => sum + ticket.satisfactionRating, 0) / ratedTickets.length
      : 0;

    res.json({
      success: true,
      data: {
        metrics: {
          totalTickets,
          openTickets,
          inProgressTickets,
          resolvedTickets,
          closedTickets,
          urgentTickets,
          avgResponseTime: Math.round(avgResponseTime),
          avgResolutionTime: Math.round(avgResolutionTime * 10) / 10,
          avgSatisfaction: Math.round(avgSatisfaction * 10) / 10,
          satisfactionCount: ratedTickets.length
        },
        ticketsByCategory: ticketsByCategory.map(item => ({
          category: item._id,
          count: item.count
        })),
        ticketsByStatus: ticketsByStatus.map(item => ({
          status: item._id,
          count: item.count
        }))
      }
    });
  } catch (error) {

    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// ==================== FAQ MANAGEMENT ====================

// @route   GET /api/support/faqs
// @desc    Get all FAQs (public or admin)
// @access  Public or Private/Admin
router.get('/faqs', async (req, res) => {
  try {
    const { category, search, featured } = req.query;
    const query = { isPublished: true };

    if (category && category !== 'all') {
      query.category = category;
    }
    if (search) {
      query.$or = [
        { question: { $regex: search, $options: 'i' } },
        { answer: { $regex: search, $options: 'i' } },
        { tags: { $in: [new RegExp(search, 'i')] } }
      ];
    }
    if (featured === 'true') {
      query.isFeatured = true;
    }

    // Admin can see unpublished FAQs
    if (req.user && req.user.role === 'admin') {
      delete query.isPublished;
    }

    const faqs = await FAQ.find(query)
      .populate('createdBy', 'name email')
      .sort({ isFeatured: -1, order: 1, createdAt: -1 });

    res.json({
      success: true,
      data: faqs
    });
  } catch (error) {

    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   GET /api/support/faqs/:id
// @desc    Get single FAQ
// @access  Public
router.get('/faqs/:id', async (req, res) => {
  try {
    const faq = await FAQ.findById(req.params.id)
      .populate('createdBy', 'name email');

    if (!faq) {
      return res.status(404).json({
        success: false,
        message: 'FAQ not found'
      });
    }

    // Increment views
    faq.views += 1;
    await faq.save();

    res.json({
      success: true,
      data: faq
    });
  } catch (error) {

    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   POST /api/support/faqs
// @desc    Create FAQ (admin only)
// @access  Private/Admin
router.post('/faqs', protect, authorize('admin'), [
  body('question').trim().notEmpty().withMessage('Question is required'),
  body('answer').trim().notEmpty().withMessage('Answer is required'),
  body('category').isIn(['general', 'billing', 'technical', 'account', 'features', 'troubleshooting', 'subscription', 'other']).withMessage('Invalid category')
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

    const { question, answer, category, tags, isPublished, isFeatured, order } = req.body;

    const faq = new FAQ({
      question,
      answer,
      category: category || 'general',
      tags: tags || [],
      isPublished: isPublished !== undefined ? isPublished : true,
      isFeatured: isFeatured || false,
      order: order || 0,
      createdBy: req.user.id
    });

    await faq.save();

    const populatedFAQ = await FAQ.findById(faq._id)
      .populate('createdBy', 'name email');

    res.status(201).json({
      success: true,
      message: 'FAQ created successfully',
      data: populatedFAQ
    });
  } catch (error) {

    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   PUT /api/support/faqs/:id
// @desc    Update FAQ (admin only)
// @access  Private/Admin
router.put('/faqs/:id', protect, authorize('admin'), async (req, res) => {
  try {
    const faq = await FAQ.findById(req.params.id);
    if (!faq) {
      return res.status(404).json({
        success: false,
        message: 'FAQ not found'
      });
    }

    const { question, answer, category, tags, isPublished, isFeatured, order } = req.body;

    if (question) faq.question = question;
    if (answer) faq.answer = answer;
    if (category) faq.category = category;
    if (tags) faq.tags = tags;
    if (isPublished !== undefined) faq.isPublished = isPublished;
    if (isFeatured !== undefined) faq.isFeatured = isFeatured;
    if (order !== undefined) faq.order = order;
    faq.updatedBy = req.user.id;

    await faq.save();

    const updatedFAQ = await FAQ.findById(faq._id)
      .populate('createdBy', 'name email')
      .populate('updatedBy', 'name email');

    res.json({
      success: true,
      message: 'FAQ updated successfully',
      data: updatedFAQ
    });
  } catch (error) {

    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   DELETE /api/support/faqs/:id
// @desc    Delete FAQ (admin only)
// @access  Private/Admin
router.delete('/faqs/:id', protect, authorize('admin'), async (req, res) => {
  try {
    const faq = await FAQ.findById(req.params.id);
    if (!faq) {
      return res.status(404).json({
        success: false,
        message: 'FAQ not found'
      });
    }

    await FAQ.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: 'FAQ deleted successfully'
    });
  } catch (error) {

    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   POST /api/support/faqs/:id/feedback
// @desc    Submit FAQ feedback (helpful/not helpful)
// @access  Public
router.post('/faqs/:id/feedback', [
  body('helpful').isBoolean().withMessage('Helpful must be boolean')
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

    const faq = await FAQ.findById(req.params.id);
    if (!faq) {
      return res.status(404).json({
        success: false,
        message: 'FAQ not found'
      });
    }

    if (req.body.helpful) {
      faq.helpful += 1;
    } else {
      faq.notHelpful += 1;
    }

    await faq.save();

    res.json({
      success: true,
      message: 'Feedback submitted successfully'
    });
  } catch (error) {

    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// ==================== KNOWLEDGE BASE ====================

// @route   GET /api/support/knowledge-base
// @desc    Get all knowledge base articles
// @access  Public or Private/Admin
router.get('/knowledge-base', async (req, res) => {
  try {
    const { category, search, featured, page = 1, limit = 20 } = req.query;
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    const query = { isPublished: true };

    if (category && category !== 'all') {
      query.category = category;
    }
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { content: { $regex: search, $options: 'i' } },
        { tags: { $in: [new RegExp(search, 'i')] } }
      ];
    }
    if (featured === 'true') {
      query.isFeatured = true;
    }

    // Admin can see unpublished articles
    if (req.user && req.user.role === 'admin') {
      delete query.isPublished;
    }

    const articles = await KnowledgeBase.find(query)
      .populate('createdBy', 'name email')
      .populate('updatedBy', 'name email')
      .sort({ isFeatured: -1, order: 1, createdAt: -1 })
      .skip(skip)
      .limit(limitNum);

    const total = await KnowledgeBase.countDocuments(query);

    res.json({
      success: true,
      data: articles,
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

// @route   GET /api/support/knowledge-base/:slug
// @desc    Get single knowledge base article
// @access  Public
router.get('/knowledge-base/:slug', async (req, res) => {
  try {
    const article = await KnowledgeBase.findOne({ slug: req.params.slug })
      .populate('createdBy', 'name email')
      .populate('updatedBy', 'name email');

    if (!article) {
      return res.status(404).json({
        success: false,
        message: 'Article not found'
      });
    }

    // Check if published (unless admin)
    if (!article.isPublished && (!req.user || req.user.role !== 'admin')) {
      return res.status(404).json({
        success: false,
        message: 'Article not found'
      });
    }

    // Increment views
    article.views += 1;
    await article.save();

    res.json({
      success: true,
      data: article
    });
  } catch (error) {

    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   POST /api/support/knowledge-base
// @desc    Create knowledge base article (admin only)
// @access  Private/Admin
router.post('/knowledge-base', protect, authorize('admin'), [
  body('title').trim().notEmpty().withMessage('Title is required'),
  body('description').trim().notEmpty().withMessage('Description is required'),
  body('content').trim().notEmpty().withMessage('Content is required'),
  body('category').isIn(['getting-started', 'menu-management', 'qr-codes', 'analytics', 'billing', 'account-settings', 'customization', 'troubleshooting', 'api-integration', 'best-practices']).withMessage('Invalid category')
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

    const { title, description, content, category, tags, isPublished, isFeatured, order, readingTime, featuredImage } = req.body;

    const article = new KnowledgeBase({
      title,
      slug: title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''),
      description,
      content,
      category: category || 'getting-started',
      tags: tags || [],
      isPublished: isPublished !== undefined ? isPublished : false,
      isFeatured: isFeatured || false,
      order: order || 0,
      readingTime: readingTime || 5,
      featuredImage: featuredImage || null,
      createdBy: req.user.id
    });

    await article.save();

    const populatedArticle = await KnowledgeBase.findById(article._id)
      .populate('createdBy', 'name email');

    res.status(201).json({
      success: true,
      message: 'Article created successfully',
      data: populatedArticle
    });
  } catch (error) {

    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   PUT /api/support/knowledge-base/:id
// @desc    Update knowledge base article (admin only)
// @access  Private/Admin
router.put('/knowledge-base/:id', protect, authorize('admin'), async (req, res) => {
  try {
    const article = await KnowledgeBase.findById(req.params.id);
    if (!article) {
      return res.status(404).json({
        success: false,
        message: 'Article not found'
      });
    }

    const { title, description, content, category, tags, isPublished, isFeatured, order, readingTime, featuredImage } = req.body;

    if (title) {
      article.title = title;
      article.slug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    }
    if (description) article.description = description;
    if (content) article.content = content;
    if (category) article.category = category;
    if (tags) article.tags = tags;
    if (isPublished !== undefined) article.isPublished = isPublished;
    if (isFeatured !== undefined) article.isFeatured = isFeatured;
    if (order !== undefined) article.order = order;
    if (readingTime !== undefined) article.readingTime = readingTime;
    if (featuredImage !== undefined) article.featuredImage = featuredImage;
    article.updatedBy = req.user.id;

    await article.save();

    const updatedArticle = await KnowledgeBase.findById(article._id)
      .populate('createdBy', 'name email')
      .populate('updatedBy', 'name email');

    res.json({
      success: true,
      message: 'Article updated successfully',
      data: updatedArticle
    });
  } catch (error) {

    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   DELETE /api/support/knowledge-base/:id
// @desc    Delete knowledge base article (admin only)
// @access  Private/Admin
router.delete('/knowledge-base/:id', protect, authorize('admin'), async (req, res) => {
  try {
    const article = await KnowledgeBase.findById(req.params.id);
    if (!article) {
      return res.status(404).json({
        success: false,
        message: 'Article not found'
      });
    }

    await KnowledgeBase.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: 'Article deleted successfully'
    });
  } catch (error) {

    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   POST /api/support/knowledge-base/:id/feedback
// @desc    Submit article feedback (helpful/not helpful)
// @access  Public
router.post('/knowledge-base/:id/feedback', [
  body('helpful').isBoolean().withMessage('Helpful must be boolean')
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

    const article = await KnowledgeBase.findById(req.params.id);
    if (!article) {
      return res.status(404).json({
        success: false,
        message: 'Article not found'
      });
    }

    if (req.body.helpful) {
      article.helpful += 1;
    } else {
      article.notHelpful += 1;
    }

    await article.save();

    res.json({
      success: true,
      message: 'Feedback submitted successfully'
    });
  } catch (error) {

    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

export default router;
