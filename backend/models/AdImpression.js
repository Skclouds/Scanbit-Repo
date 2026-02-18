import mongoose from 'mongoose';

const adImpressionSchema = new mongoose.Schema({
  advertisement: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Advertisement',
    required: true
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  sessionId: {
    type: String,
    required: true
  },
  page: {
    type: String,
    required: true
  },
  businessCategory: {
    type: String,
    default: null
  },
  device: {
    type: {
      type: String,
      enum: ['desktop', 'mobile', 'tablet'],
      default: 'desktop'
    },
    userAgent: {
      type: String,
      default: ''
    }
  },
  clicked: {
    type: Boolean,
    default: false
  },
  clickedAt: {
    type: Date,
    default: null
  },
  converted: {
    type: Boolean,
    default: false
  },
  convertedAt: {
    type: Date,
    default: null
  },
  ipAddress: {
    type: String,
    default: null
  },
  referrer: {
    type: String,
    default: null
  },
  timestamp: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Indexes for analytics queries
adImpressionSchema.index({ advertisement: 1, timestamp: -1 });
adImpressionSchema.index({ user: 1, timestamp: -1 });
adImpressionSchema.index({ sessionId: 1 });
adImpressionSchema.index({ page: 1, timestamp: -1 });
adImpressionSchema.index({ clicked: 1, timestamp: -1 });

const AdImpression = mongoose.model('AdImpression', adImpressionSchema);

export default AdImpression;
