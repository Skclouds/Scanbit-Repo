import mongoose from 'mongoose';

const supportTicketSchema = new mongoose.Schema({
  ticketNumber: {
    type: String,
    required: true,
    unique: true,
    default: () => `TKT-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  restaurant: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Restaurant',
    default: null
  },
  subject: {
    type: String,
    required: [true, 'Subject is required'],
    trim: true
  },
  description: {
    type: String,
    required: [true, 'Description is required'],
    trim: true
  },
  category: {
    type: String,
    required: true,
    enum: ['technical', 'billing', 'account', 'feature-request', 'bug-report', 'general', 'subscription', 'other'],
    default: 'general'
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'urgent'],
    default: 'medium'
  },
  status: {
    type: String,
    enum: ['open', 'in-progress', 'resolved', 'closed', 'pending'],
    default: 'open'
  },
  assignedTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  messages: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    message: {
      type: String,
      required: true,
      trim: true
    },
    attachments: [{
      url: String,
      filename: String,
      fileType: String,
      fileSize: Number
    }],
    isInternal: {
      type: Boolean,
      default: false
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  }],
  tags: [{
    type: String,
    trim: true
  }],
  resolution: {
    type: String,
    default: null
  },
  resolvedAt: {
    type: Date,
    default: null
  },
  resolvedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  satisfactionRating: {
    type: Number,
    min: 1,
    max: 5,
    default: null
  },
  satisfactionFeedback: {
    type: String,
    default: null
  },
  firstResponseAt: {
    type: Date,
    default: null
  },
  lastResponseAt: {
    type: Date,
    default: Date.now
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Indexes for better query performance
supportTicketSchema.index({ user: 1, createdAt: -1 });
supportTicketSchema.index({ restaurant: 1, createdAt: -1 });
supportTicketSchema.index({ status: 1, priority: -1 });
supportTicketSchema.index({ assignedTo: 1, status: 1 });
supportTicketSchema.index({ category: 1 });
// ticketNumber index is already created by unique: true, so we don't need to add it again
supportTicketSchema.index({ createdAt: -1 });

// Virtual for response time
supportTicketSchema.virtual('firstResponseTime').get(function() {
  if (!this.firstResponseAt || !this.createdAt) return null;
  return Math.floor((this.firstResponseAt - this.createdAt) / (1000 * 60)); // minutes
});

// Virtual for resolution time
supportTicketSchema.virtual('resolutionTime').get(function() {
  if (!this.resolvedAt || !this.createdAt) return null;
  return Math.floor((this.resolvedAt - this.createdAt) / (1000 * 60 * 60)); // hours
});

// Method to add message
supportTicketSchema.methods.addMessage = function(userId, message, isInternal = false, attachments = []) {
  this.messages.push({
    user: userId,
    message,
    isInternal,
    attachments,
    createdAt: new Date()
  });
  
  // Set first response time if this is the first admin response
  if (!this.firstResponseAt && isInternal) {
    this.firstResponseAt = new Date();
  }
  
  this.lastResponseAt = new Date();
  return this.save();
};

// Method to update status
supportTicketSchema.methods.updateStatus = function(status, userId = null) {
  this.status = status;
  if (status === 'resolved' || status === 'closed') {
    this.resolvedAt = new Date();
    if (userId) {
      this.resolvedBy = userId;
    }
  }
  this.updatedAt = new Date();
  return this.save();
};

const SupportTicket = mongoose.model('SupportTicket', supportTicketSchema);

export default SupportTicket;
