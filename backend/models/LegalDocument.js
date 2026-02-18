import mongoose from 'mongoose';

const legalDocumentSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Title is required'],
    trim: true
  },
  slug: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true
  },
  type: {
    type: String,
    required: true,
    enum: ['privacy-policy', 'terms-conditions', 'cookie-policy', 'refund-policy', 'shipping-policy', 'user-agreement', 'other'],
    default: 'privacy-policy'
  },
  content: {
    type: String,
    required: [true, 'Content is required'],
    trim: true
  },
  shortDescription: {
    type: String,
    trim: true,
    default: ''
  },
  version: {
    type: String,
    default: '1.0'
  },
  effectiveDate: {
    type: Date,
    default: Date.now
  },
  lastUpdated: {
    type: Date,
    default: Date.now
  },
  isActive: {
    type: Boolean,
    default: true
  },
  isDefault: {
    type: Boolean,
    default: false
  },
  language: {
    type: String,
    default: 'en',
    enum: ['en', 'es', 'fr', 'de', 'it', 'pt', 'hi', 'other']
  },
  views: {
    type: Number,
    default: 0
  },
  requiresAcceptance: {
    type: Boolean,
    default: false
  },
  acceptanceRequiredFor: {
    type: [String],
    enum: ['signup', 'checkout', 'download', 'all'],
    default: []
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  updatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
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

// Generate slug from title before saving
legalDocumentSchema.pre('save', function(next) {
  if (this.isModified('title') && !this.slug) {
    this.slug = this.title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
  }
  if (this.isModified('content') || this.isModified('title')) {
    this.lastUpdated = new Date();
  }
  next();
});

// Ensure only one default document per type
legalDocumentSchema.pre('save', async function(next) {
  if (this.isDefault && this.isModified('isDefault')) {
    await mongoose.model('LegalDocument').updateMany(
      { type: this.type, _id: { $ne: this._id } },
      { isDefault: false }
    );
  }
  next();
});

// Indexes (slug index created automatically by unique: true on field)
legalDocumentSchema.index({ type: 1, isActive: 1 });
legalDocumentSchema.index({ isDefault: 1, type: 1 });
legalDocumentSchema.index({ createdAt: -1 });

const LegalDocument = mongoose.model('LegalDocument', legalDocumentSchema);

export default LegalDocument;
